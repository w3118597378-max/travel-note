import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTripId } from '@/lib/utils'
import { useTripStore } from './useTripStore'

export interface Expense {
  id: string
  tripId: string
  day: number
  amountLocal: number
  amountBase: number
  category: string
  note?: string
  date: string
  createdAt: string
}

interface SyncItem {
  type: 'add' | 'delete'
  expense: Expense
}

interface BudgetState {
  expenses: Expense[]
  syncQueue: SyncItem[]
  loading: boolean
  error?: string
  initialized: boolean
  setExpenses: (expenses: Expense[]) => void
  addExpenseLocal: (expense: Expense) => void
  removeExpenseLocal: (id: string) => void
  addToQueue: (item: SyncItem) => void
  removeFromQueue: (expenseId: string) => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      expenses: [],
      syncQueue: [],
      loading: false,
      initialized: false,
      setExpenses: (expenses) => set({ expenses, initialized: true }),
      addExpenseLocal: (expense) => set({ expenses: [expense, ...get().expenses] }),
      removeExpenseLocal: (id) =>
        set({ expenses: get().expenses.filter((e) => e.id !== id) }),
      addToQueue: (item) => set({ syncQueue: [...get().syncQueue, item] }),
      removeFromQueue: (id) =>
        set({ syncQueue: get().syncQueue.filter((i) => i.expense.id !== id) })
    }),
    {
      name: `jp-trip-expenses-${getTripId()}`
    }
  )
)

export function useBudget() {
  const activeTrip = useTripStore(s => s.getActiveTrip())
  const tripId = activeTrip ? (activeTrip as any).id || 'japan-trip-2025' : 'default'
  const {
    expenses,
    syncQueue,
    loading,
    error,
    initialized,
    setExpenses,
    addExpenseLocal,
    removeExpenseLocal,
    addToQueue,
    removeFromQueue
  } = useBudgetStore()

  // Process sync queue when online
  async function processQueue() {
    if (!db || typeof navigator === 'undefined' || !navigator.onLine) return
    if (syncQueue.length === 0) return

    const queue = [...syncQueue]
    for (const item of queue) {
      try {
        if (item.type === 'add') {
          await addDoc(collection(db, 'trips', tripId, 'expenses'), item.expense)
        } else if (item.type === 'delete') {
          await deleteDoc(doc(db, 'trips', tripId, 'expenses', item.expense.id))
        }
        removeFromQueue(item.expense.id)
      } catch (e) {
        console.error('Sync failed for item:', item, e)
        break // Stop and wait for next try
      }
    }
  }

  async function syncFromFirestoreOnce() {
    if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) return
    try {
      useBudgetStore.setState({ loading: true, error: undefined })
      const snap = await getDocs(collection(db, 'trips', tripId, 'expenses'))
      const remote: Expense[] = []
      snap.forEach((d) => {
        const data = d.data() as any
        remote.push({
          id: d.id,
          tripId: data.tripId ?? tripId,
          day: data.day ?? 1,
          amountLocal: data.amountLocal ?? data.amountJPY ?? data.amount ?? 0,
          amountBase: data.amountBase ?? data.amountTWD ?? 0,
          category: data.category ?? '其他',
          note: data.note,
          date: data.date ?? new Date().toISOString(),
          createdAt:
            typeof data.createdAt === 'string'
              ? data.createdAt
              : data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString()
        })
      })

      const existing = useBudgetStore.getState().expenses
      const mergedById = new Map<string, Expense>()
        ;[...existing, ...remote].forEach((e) => {
          const prev = mergedById.get(e.id)
          if (!prev || prev.createdAt < e.createdAt) {
            mergedById.set(e.id, e)
          }
        })

      // Filter out deleted items if any sync issues occurred
      const finalExpenses = Array.from(mergedById.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setExpenses(finalExpenses)
      useBudgetStore.setState({ loading: false })
      void processQueue()
    } catch (e: any) {
      useBudgetStore.setState({ loading: false, error: e?.message ?? 'budget_sync_error' })
    }
  }

  async function addExpense(input: Omit<Expense, 'id' | 'createdAt' | 'tripId'>) {
    const expense: Expense = {
      ...input,
      tripId,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString()
    }

    addExpenseLocal(expense)
    const syncItem: SyncItem = { type: 'add', expense }
    addToQueue(syncItem)
    void processQueue()
  }

  async function removeExpense(id: string) {
    const expense = expenses.find(e => e.id === id)
    if (!expense) return

    removeExpenseLocal(id)
    const syncItem: SyncItem = { type: 'delete', expense }
    addToQueue(syncItem)
    void processQueue()
  }

  const filteredExpenses = expenses.filter(e => e.tripId === tripId)
  const totalBase = filteredExpenses.reduce((sum, e) => sum + (e.amountBase || 0), 0)

  return {
    expenses: filteredExpenses,
    syncQueue,
    loading,
    error,
    initialized,
    syncFromFirestoreOnce,
    addExpense,
    removeExpense,
    totalBase,
    processQueue
  }
}

