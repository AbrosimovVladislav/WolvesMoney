// src/db.js
// ─── Ice Wolves — Database API layer ─────────────────────────────────────────
// All data operations go through this file.
// Import and use in App.jsx instead of local state.

import { supabase } from './supabaseClient'

const DEFAULT_FEE = 1500

// ─── PLAYERS ─────────────────────────────────────────────────────────────────

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function addPlayer(name) {
  const { data, error } = await supabase
    .from('players')
    .insert({ name, balance: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removePlayer(id) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── TRAININGS ───────────────────────────────────────────────────────────────

export async function getTrainings() {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createTraining({ date, ice_cost = 18000, notes = '' }) {
  const { data, error } = await supabase
    .from('trainings')
    .insert({ date, ice_cost, notes, total_collected: 0, result_balance: -ice_cost })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeTraining(id) {
  // Get training result before deleting (to reverse team balance)
  const { data: training } = await supabase
    .from('trainings').select('result_balance').eq('id', id).single()

  const { error } = await supabase
    .from('trainings').delete().eq('id', id)
  if (error) throw error

  // Reverse team balance
  if (training) {
    await supabase.rpc('adjust_team_balance', { amount: -training.result_balance })
  }
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export async function getPayments(trainingId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, players(name)')
    .eq('training_id', trainingId)
  if (error) throw error
  return data
}

export async function getPlayerPayments(playerId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, trainings(date)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function savePayments(trainingId, amounts) {
  // amounts: { [playerId]: amount }
  const { data: training, error: tErr } = await supabase
    .from('trainings').select('ice_cost').eq('id', trainingId).single()
  if (tErr) throw tErr

  // Get old payments to reverse player balances
  const { data: oldPayments } = await supabase
    .from('payments').select('*').eq('training_id', trainingId)

  const oldCollected = (oldPayments || []).reduce((s, p) => s + p.amount, 0)
  const oldResult = oldCollected - training.ice_cost

  // Reverse old player balances
  for (const pay of (oldPayments || [])) {
    const diff = pay.amount - DEFAULT_FEE
    if (diff !== 0) {
      await supabase.rpc('adjust_player_balance', { player_id: pay.player_id, amount: -diff })
    }
  }

  // Delete old payments
  await supabase.from('payments').delete().eq('training_id', trainingId)

  // Insert new payments & update player balances
  let newCollected = 0
  const inserts = []
  for (const [pid, amt] of Object.entries(amounts)) {
    const numAmt = Number(amt) || 0
    inserts.push({ player_id: Number(pid), training_id: trainingId, amount: numAmt })
    newCollected += numAmt
  }

  if (inserts.length > 0) {
    const { error: iErr } = await supabase.from('payments').insert(inserts)
    if (iErr) throw iErr
  }

  // Update player balances
  for (const [pid, amt] of Object.entries(amounts)) {
    const diff = (Number(amt) || 0) - DEFAULT_FEE
    if (diff !== 0) {
      await supabase.rpc('adjust_player_balance', { player_id: Number(pid), amount: diff })
    }
  }

  const newResult = newCollected - training.ice_cost

  // Update training summary
  await supabase.from('trainings')
    .update({ total_collected: newCollected, result_balance: newResult })
    .eq('id', trainingId)

  // Update team balance
  await supabase.rpc('adjust_team_balance', { amount: newResult - oldResult })

  return { collected: newCollected, result: newResult }
}

// ─── TEAM BALANCE ─────────────────────────────────────────────────────────────

export async function getTeamBalance() {
  const { data, error } = await supabase
    .from('team_balance').select('balance').eq('id', 1).single()
  if (error) throw error
  return data.balance
}

// ─── FULL STATE (for initial load) ───────────────────────────────────────────

export async function loadFullState() {
  const [players, trainings, payments, balance] = await Promise.all([
    getPlayers(),
    getTrainings(),
    supabase.from('payments').select('*').then(r => r.data || []),
    getTeamBalance(),
  ])
  return { players, trainings, payments, teamBalance: balance }
}
