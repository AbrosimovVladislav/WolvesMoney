import { supabase } from "./supabaseClient";

const DEFAULT_FEE = 1500;

export type Player = {
  id: number;
  name: string;
  balance: number;
  created_at?: string;
};

export type Training = {
  id: number;
  date: string;
  ice_cost: number;
  total_collected: number;
  result_balance: number;
  notes: string | null;
  created_at?: string;
};

export type Payment = {
  id: number;
  player_id: number;
  training_id: number;
  amount: number;
  created_at?: string;
};

export type FullState = {
  players: Player[];
  trainings: Training[];
  payments: Payment[];
  teamBalance: number;
};

// ─── PLAYERS ────────────────────────────────────────────────────────────────────

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function addPlayer(name: string): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name, balance: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removePlayer(id: number): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

// ─── TRAININGS ─────────────────────────────────────────────────────────────────

export async function getTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as Training[]) ?? [];
}

export async function createTraining(input: {
  date: string;
  ice_cost?: number;
  notes?: string;
}): Promise<Training> {
  const { date, ice_cost = 18000, notes = "" } = input;
  const { data, error } = await supabase
    .from("trainings")
    .insert({
      date,
      ice_cost,
      notes,
      total_collected: 0,
      result_balance: -ice_cost,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Training;
}

export async function removeTraining(id: number): Promise<void> {
  const { data: training } = await supabase
    .from("trainings")
    .select("result_balance")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("trainings").delete().eq("id", id);
  if (error) throw error;

  if (training) {
    await supabase.rpc("adjust_team_balance", {
      amount: -training.result_balance,
    });
  }
}

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────

export async function getPaymentsForTraining(
  trainingId: number,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("training_id", trainingId);
  if (error) throw error;
  return (data as Payment[]) ?? [];
}

export async function savePayments(
  trainingId: number,
  amounts: Record<number, number>,
): Promise<{ collected: number; result: number }> {
  const { data: training, error: tErr } = await supabase
    .from("trainings")
    .select("ice_cost")
    .eq("id", trainingId)
    .single();
  if (tErr) throw tErr;

  const { data: oldPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("training_id", trainingId);

  const oldCollected = (oldPayments ?? []).reduce(
    (s, p) => s + (p.amount as number),
    0,
  );
  const oldResult = oldCollected - (training?.ice_cost ?? 0);

  // Reverse old player balances
  for (const pay of oldPayments ?? []) {
    const diff = (pay.amount as number) - DEFAULT_FEE;
    if (diff !== 0) {
      await supabase.rpc("adjust_player_balance", {
        player_id: pay.player_id,
        amount: -diff,
      });
    }
  }

  await supabase.from("payments").delete().eq("training_id", trainingId);

  let newCollected = 0;
  const inserts: { player_id: number; training_id: number; amount: number }[] =
    [];

  for (const [pid, amt] of Object.entries(amounts)) {
    const numAmt = Number(amt) || 0;
    inserts.push({
      player_id: Number(pid),
      training_id: trainingId,
      amount: numAmt,
    });
    newCollected += numAmt;
  }

  if (inserts.length > 0) {
    const { error: iErr } = await supabase.from("payments").insert(inserts);
    if (iErr) throw iErr;
  }

  // Update player balances
  for (const [pid, amt] of Object.entries(amounts)) {
    const diff = (Number(amt) || 0) - DEFAULT_FEE;
    if (diff !== 0) {
      await supabase.rpc("adjust_player_balance", {
        player_id: Number(pid),
        amount: diff,
      });
    }
  }

  const newResult = newCollected - (training?.ice_cost ?? 0);

  await supabase
    .from("trainings")
    .update({
      total_collected: newCollected,
      result_balance: newResult,
    })
    .eq("id", trainingId);

  await supabase.rpc("adjust_team_balance", {
    amount: newResult - oldResult,
  });

  return { collected: newCollected, result: newResult };
}

// ─── TEAM BALANCE & FULL STATE ────────────────────────────────────────────────

export async function getTeamBalance(): Promise<number> {
  const { data, error } = await supabase
    .from("team_balance")
    .select("balance")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function loadFullState(): Promise<FullState> {
  const [players, trainings, paymentsRes, balance] = await Promise.all([
    getPlayers(),
    getTrainings(),
    supabase.from("payments").select("*"),
    getTeamBalance(),
  ]);

  const payments = (paymentsRes.data as Payment[]) ?? [];

  return {
    players,
    trainings,
    payments,
    teamBalance: balance,
  };
}

