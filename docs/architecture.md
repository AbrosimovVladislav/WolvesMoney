# Архитектура и стек

## Технологии

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 15 (App Router) |
| Язык | TypeScript |
| Стили | CSS-переменные (globals.css) + inline styles |
| База данных | Supabase (PostgreSQL) |
| Деплой | Vercel |

---

## Структура файлов

```
src/
├── app/
│   ├── layout.tsx          # Корневой лэйаут, оборачивает в FinanceStateProvider
│   ├── page.tsx            # Главная страница: навигация + роутинг вкладок
│   └── globals.css         # CSS-переменные, базовые стили
├── components/
│   ├── Dashboard.tsx       # Экран Home
│   ├── Players.tsx         # Экран Players
│   ├── Trainings.tsx       # Экран Ice Time
│   ├── PaymentsView.tsx    # Экран Payments (суб-экран)
│   ├── Statistics.tsx      # Экран Stats
│   ├── IceWolvesIcons.tsx  # SVG-иконки
│   └── common.tsx          # Утилиты: fmt, fmtShort, initials, Toast
├── context/
│   └── FinanceState.tsx    # React Context + useReducer, все действия
└── lib/
    ├── db.ts               # Все запросы к Supabase
    └── supabaseClient.ts   # Инициализация Supabase клиента
```

---

## Поток данных

```
Supabase DB
    ↕  (db.ts)
FinanceStateProvider  ←  useReducer(FinanceState)
    ↕  (useFinance())
Компоненты (Dashboard, Players, Trainings, PaymentsView, Statistics)
```

- Данные загружаются один раз при монтировании через `loadFullState()`
- После любого мутирующего действия вызывается `load()` → перезагрузка всего стейта
- Нет optimistic updates — всегда ждём ответа от сервера

---

## Модель данных

### Player
```ts
{
  id: number
  name: string
  balance: number      // накопительный баланс: >0 = переплата (кредит), <0 = долг
}
```

### Training
```ts
{
  id: number
  date: string         // ISO date "YYYY-MM-DD"
  ice_cost: number     // стоимость льда (дефолт: 18 000 RSD)
  notes: string | null
  total_collected: number   // сумма всех платежей за тренировку
  result_balance: number    // total_collected - ice_cost
}
```

### Payment
```ts
{
  id: number
  player_id: number
  training_id: number
  amount: number       // сумма платежа (0 = не платил)
}
```

### TeamBalance
```ts
{
  id: 1             // одна запись в таблице team_balance
  balance: number   // суммарный result_balance всех тренировок
}
```

---

## Бизнес-логика балансов

### Стандартный взнос
`DEFAULT_FEE = 1 500 RSD`

### Баланс игрока
При сохранении платежей:
- `diff = amount - DEFAULT_FEE`
- `player.balance += diff`
- Игрок заплатил 2 000 → balance +500 (кредит)
- Игрок заплатил 1 000 → balance −500 (долг)
- Игрок заплатил 1 500 → balance не меняется

### Баланс команды
- При сохранении платежей: `teamBalance += newResult - oldResult`
- При удалении тренировки: `teamBalance -= training.result_balance`
- Изменяется через Supabase RPC `adjust_team_balance`

---

## Supabase RPC функции

| Функция | Параметры | Действие |
|---------|-----------|----------|
| `adjust_team_balance` | `amount` | атомарно меняет `team_balance.balance` |
| `adjust_player_balance` | `player_id`, `amount` | атомарно меняет `players.balance` |

---

## CSS дизайн-система

Тема — тёмная (dark). Основные переменные:

| Переменная | Назначение |
|-----------|-----------|
| `--bg` | основной фон |
| `--bg2`, `--bg3` | вторичные фоны, карточки |
| `--white` | основной текст |
| `--muted` | второстепенный текст |
| `--green` | положительные значения, оплачено |
| `--red` | отрицательные значения, долги |
| `--blue` | акцентный цвет, нейтральные данные |
| `--gold` | топ-результаты |
| `--cyan` | акцентный вторичный |
| `--border` | границы |
| `--font-display` | заголовки (uppercase) |
| `--font-mono` | числовые значения |
