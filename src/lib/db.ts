import { supabase } from "./supabaseClient";

export type Player = {
  id: number;
  name: string;
  balance: number;
  default_fee: number;
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
  attended: boolean;
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

export async function addPlayer(name: string, defaultFee = 1500): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name, balance: 0, default_fee: defaultFee })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removePlayer(id: number): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

export async function updatePlayerFee(id: number, fee: number): Promise<void> {
  const { error } = await supabase
    .from("players")
    .update({ default_fee: fee })
    .eq("id", id);
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

  const { data: payments } = await supabase
    .from("payments")
    .select("player_id, amount, attended")
    .eq("training_id", id);

  const playerIds = [...new Set((payments ?? []).map((p) => p.player_id))];
  const { data: playersData } = playerIds.length
    ? await supabase.from("players").select("id, default_fee").in("id", playerIds)
    : { data: [] };
  const feeMap: Record<number, number> = {};
  (playersData ?? []).forEach((p) => { feeMap[p.id] = p.default_fee; });

  const { error } = await supabase.from("trainings").delete().eq("id", id);
  if (error) throw error;

  for (const pay of payments ?? []) {
    if (!pay.attended) continue;
    const defaultFee = feeMap[pay.player_id] ?? 1500;
    const diff = (pay.amount as number) - defaultFee;
    if (diff !== 0) {
      await supabase.rpc("adjust_player_balance", {
        player_id: pay.player_id,
        amount: -diff,
      });
    }
  }

  if (training) {
    await supabase.rpc("adjust_team_balance", { amount: -training.result_balance });
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
  entries: Record<number, { attended: boolean; amount: number }>,
): Promise<{ collected: number; result: number }> {
  const { data: training, error: tErr } = await supabase
    .from("trainings")
    .select("ice_cost")
    .eq("id", trainingId)
    .single();
  if (tErr) throw tErr;

  const { data: oldPayments } = await supabase
    .from("payments")
    .select("player_id, amount, attended")
    .eq("training_id", trainingId);

  const oldCollected = (oldPayments ?? []).reduce(
    (s, p) => s + (p.amount as number),
    0,
  );
  const oldResult = oldCollected - (training?.ice_cost ?? 0);

  const allPlayerIds = [
    ...new Set([
      ...(oldPayments ?? []).map((p) => p.player_id),
      ...Object.keys(entries).map(Number),
    ]),
  ];
  const { data: playersData } = allPlayerIds.length
    ? await supabase.from("players").select("id, default_fee").in("id", allPlayerIds)
    : { data: [] };
  const feeMap: Record<number, number> = {};
  (playersData ?? []).forEach((p) => { feeMap[p.id] = p.default_fee; });

  // Reverse old player balances (attended only)
  for (const pay of oldPayments ?? []) {
    if (!pay.attended) continue;
    const defaultFee = feeMap[pay.player_id] ?? 1500;
    const diff = (pay.amount as number) - defaultFee;
    if (diff !== 0) {
      await supabase.rpc("adjust_player_balance", {
        player_id: pay.player_id,
        amount: -diff,
      });
    }
  }

  await supabase.from("payments").delete().eq("training_id", trainingId);

  let newCollected = 0;
  const inserts: {
    player_id: number;
    training_id: number;
    amount: number;
    attended: boolean;
  }[] = [];

  for (const [pid, entry] of Object.entries(entries)) {
    const numPid = Number(pid);
    const amount = entry.attended ? (Number(entry.amount) || 0) : 0;
    inserts.push({ player_id: numPid, training_id: trainingId, amount, attended: entry.attended });
    newCollected += amount;
  }

  if (inserts.length > 0) {
    const { error: iErr } = await supabase.from("payments").insert(inserts);
    if (iErr) throw iErr;
  }

  // Apply new player balances (attended only)
  for (const [pid, entry] of Object.entries(entries)) {
    if (!entry.attended) continue;
    const numPid = Number(pid);
    const defaultFee = feeMap[numPid] ?? 1500;
    const diff = (Number(entry.amount) || 0) - defaultFee;
    if (diff !== 0) {
      await supabase.rpc("adjust_player_balance", { player_id: numPid, amount: diff });
    }
  }

  const newResult = newCollected - (training?.ice_cost ?? 0);

  await supabase
    .from("trainings")
    .update({ total_collected: newCollected, result_balance: newResult })
    .eq("id", trainingId);

  await supabase.rpc("adjust_team_balance", { amount: newResult - oldResult });

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

  return { players, trainings, payments, teamBalance: balance };
}
