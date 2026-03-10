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
} from "../lib/db";

export type PlayerState = {
  id: number;
  name: string;
  balance: number;
};

export type TrainingState = {
  id: number;
  date: string;
  iceCost: number;
  notes: string | null;
  totalCollected: number;
  resultBalance: number;
};

export type PaymentState = {
  id: number;
  playerId: number;
  trainingId: number;
  amount: number;
};

export type FinanceState = {
  players: PlayerState[];
  trainings: TrainingState[];
  payments: PaymentState[];
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
    })),
    trainings: full.trainings.map((t) => ({
      id: t.id,
      date: t.date,
      iceCost: t.ice_cost,
      notes: t.notes,
      totalCollected: t.total_collected,
      resultBalance: t.result_balance,
    })),
    payments: full.payments.map((p) => ({
      id: p.id,
      playerId: p.player_id,
      trainingId: p.training_id,
      amount: p.amount,
    })),
    teamBalance: full.teamBalance,
  };
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case "SET_FROM_SERVER":
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };
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
  addPlayer: (name: string) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
  createTraining: (input: { date: string; iceCost: number; notes: string }) => Promise<void>;
  removeTraining: (id: number) => Promise<void>;
  savePayments: (trainingId: number, amounts: Record<number, number>) => Promise<void>;
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
      dispatch({
        type: "SET_ERROR",
        payload: err?.message || "Failed to load data",
      });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value: FinanceContextValue = useMemo(
    () => ({
      state,
      refresh: load,
      addPlayer: async (name: string) => {
        await dbAddPlayer(name);
        await load();
      },
      removePlayer: async (id: number) => {
        await dbRemovePlayer(id);
        await load();
      },
      createTraining: async (input) => {
        await dbCreateTraining({
          date: input.date,
          ice_cost: input.iceCost,
          notes: input.notes,
        });
        await load();
      },
      removeTraining: async (id: number) => {
        await dbRemoveTraining(id);
        await load();
      },
      savePayments: async (trainingId, amounts) => {
        await dbSavePayments(trainingId, amounts);
        await load();
      },
    }),
    [state, load],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance must be used within FinanceStateProvider");
  }
  return ctx;
}

