# BLOCKERS

> Last updated: 2026-03-29

No blockers at this time. All completion gates passed.

## Gate Status

| Gate | Status |
|------|--------|
| `cd backend && npm run dev` avvia su porta 3002 | ✅ |
| Al primo avvio il DB si crea e il seed viene eseguito automaticamente | ✅ |
| `GET /api/boards/main` restituisce board con colonne e card | ✅ |
| `cd frontend && npm run dev` avvia su porta 5174 | ✅ |
| Board mostra le 4 colonne con le card seed | ✅ |
| Drag-and-drop sposta card tra colonne e registra in `card_history` | ✅ |
| CardModal crea e salva nuove card | ✅ |
| CardModal mostra storico movimenti | ✅ |
| Search filtra le card in tempo reale | ✅ |
| `cd frontend && npm run build` completa senza warning TypeScript | ✅ |
