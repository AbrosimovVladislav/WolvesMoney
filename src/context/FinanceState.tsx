"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";
import type { FullState } from "../lib/db";
import {
  loadFullState,
  addPlayer as dbAddPlayer,
  removePlayer as dbRemovePlayer,
  createTraining as dbCreateTraining,
  removeTraining as dbRemoveTraining,
  savePayments as dbSavePayments,
  updatePlayerFee as dbUpdatePlayerFee,
  addDeposit as dbAddDeposit,
  markIcePaid as dbMarkIcePaid,
} from "../lib/db";

export type PlayerState = {
  id: number;
  name: string;
  balance: number;
  defaultFee: number;
};

export type TrainingState = {
  id: number;
  date: string;
  iceCost: number;
  goalieCost: number;
  notes: string | null;
  totalCollected: number;
  resultBalance: number;
  icePaid: boolean;
};

export type PaymentState = {
  id: number;
  playerId: number;
  trainingId: number;
  amount: number;
  attended: boolean;
};

export type DepositState = {
  id: number;
  playerId: number;
  amount: number;
  note: string;
  createdAt?: string;
};

export type FinanceState = {
  players: PlayerState[];
  trainings: TrainingState[];
  payments: PaymentState[];
  deposits: DepositState[];
  teamBalance: number;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_FROM_SERVER"; payload: Omit<FinanceState, "loading" | "error"> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: FinanceState = {
  players: [],
  trainings: [],
  payments: [],
  deposits: [],
  teamBalance: 0,
  loading: true,
  error: null,
};

function mapFromFullState(full: FullState): Omit<FinanceState, "loading" | "error"> {
  return {
    players: full.players.map((p) => ({
      id: p.id,
      name: p.name,
      balance: p.balance,
      defaultFee: p.default_fee,
    })),
    trainings: full.trainings.map((t) => ({
      id: t.id,
      date: t.date,
      iceCost: t.ice_cost,
      goalieCost: t.goalie_cost ?? 0,
      notes: t.notes,
      totalCollected: t.total_collected,
      resultBalance: t.result_balance,
      icePaid: t.ice_paid ?? false,
    })),
    payments: full.payments.map((p) => ({
      id: p.id,
      playerId: p.player_id,
      trainingId: p.training_id,
      amount: p.amount,
      attended: p.attended,
    })),
    deposits: full.deposits.map((d) => ({
      id: d.id,
      playerId: d.player_id,
      amount: d.amount,
      note: d.note,
      createdAt: d.created_at,
    })),
    teamBalance: full.teamBalance,
  };
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case "SET_FROM_SERVER":
      return { ...state, ...action.payload, loading: false, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

type FinanceContextValue = {
  state: FinanceState;
  refresh: () => Promise<void>;
  addPlayer: (name: string, defaultFee?: number) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
  createTraining: (input: { date: string; iceCost: number; notes: string }) => Promise<void>;
  removeTraining: (id: number) => Promise<void>;
  savePayments: (
    trainingId: number,
    entries: Record<number, { attended: boolean; amount: number }>,
    goalieCost?: number,
  ) => Promise<void>;
  updatePlayerFee: (id: number, fee: number) => Promise<void>;
  addDeposit: (playerId: number, amount: number, note?: string) => Promise<void>;
  markIcePaid: (id: number, paid: boolean) => Promise<void>;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const full = await loadFullState();
      dispatch({ type: "SET_FROM_SERVER", payload: mapFromFullState(full) });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", payload: err?.message || "Failed to load data" });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const value: FinanceContextValue = useMemo(
    () => ({
      state,
      refresh: load,
      addPlayer: async (name, defaultFee) => { await dbAddPlayer(name, defaultFee); await load(); },
      removePlayer: async (id) => { await dbRemovePlayer(id); await load(); },
      createTraining: async (input) => {
        await dbCreateTraining({ date: input.date, ice_cost: input.iceCost, notes: input.notes });
        await load();
      },
      removeTraining: async (id) => { await dbRemoveTraining(id); await load(); },
      savePayments: async (trainingId, entries, goalieCost = 0) => {
        await dbSavePayments(trainingId, entries, goalieCost);
        await load();
      },
      updatePlayerFee: async (id, fee) => { await dbUpdatePlayerFee(id, fee); await load(); },
      addDeposit: async (playerId, amount, note = "") => {
        await dbAddDeposit(playerId, amount, note);
        await load();
      },
      markIcePaid: async (id, paid) => {
        await dbMarkIcePaid(id, paid);
        await load();
      },
    }),
    [state, load],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceStateProvider");
  return ctx;
}
