---
name: verify-build
description: Run a full project verification suite — TypeScript check, production build, database sync, and live server test. Use when the user asks to "verify", "test", "check if everything works", "prüfen ob alles läuft", or uses /verify-build.
metadata:
  author: local
  version: "1.0.0"
---

# Verify Build

Run a complete verification of the current Next.js project to ensure everything compiles, the database is in sync, and all pages respond correctly.

## Steps to Execute

### 1. TypeScript Check
```bash
npx tsc --noEmit 2>&1
```
Report any type errors found. If none → ✅ TypeScript OK

### 2. Kill any running dev servers
```bash
kill $(lsof -ti:3000) $(lsof -ti:3001) $(lsof -ti:3002) $(lsof -ti:3003) $(lsof -ti:3004) $(lsof -ti:3005) 2>/dev/null; sleep 2
```

### 3. Clear build cache
```bash
rm -rf .next
```

### 4. Production Build
```bash
npm run build 2>&1
```
- Check for compilation errors
- Check for TypeScript errors during build
- Report all routes found
- If `✓ Compiled successfully` → ✅ Build OK

### 5. Database sync
```bash
npx prisma db push 2>&1 | tail -5
```
Ensure schema is in sync. If `Your database is now in sync` → ✅ DB OK

### 6. Start dev server
```bash
nohup npm run dev > /tmp/verify-build.log 2>&1 &
sleep 12
```
Get the port from `/tmp/verify-build.log`.

### 7. Test all pages
Test every route with curl. Expected: all return HTTP 200 (or 401 for protected API routes).

Pages to test (adapt to the routes found in step 4):
- `/ar` — Arabic home
- `/en` — English home
- `/ar/login`
- `/ar/register`
- `/ar/find-jobs`
- `/ar/post-job`
- `/ar/my-jobs`
- `/ar/my-bids`
- `/ar/messages`
- `/ar/payment/checkout`
- `/api/jobs`
- `/api/categories`
- `/api/bids/me` (expect 401 — auth required)

### 8. Check for runtime errors
```bash
cat /tmp/verify-build.log | grep -E "(⨯|TypeError|IntlError|RangeError|Error:)" | grep -v "node_modules" | sort -u
```
If empty → ✅ No runtime errors

### 9. Test critical user flows via API
```bash
# Register a new user
curl -s -X POST http://localhost:PORT/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Verify Test","email":"verify_TIMESTAMP@test.com","password":"test12345","confirmPassword":"test12345","role":"CUSTOMER","governorate":"Damascus"}'

# List categories
curl -s http://localhost:PORT/api/categories | python3 -c "import sys,json; cats=json.load(sys.stdin); print(f'Categories: {len(cats)}')"

# List jobs
curl -s http://localhost:PORT/api/jobs | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Jobs: {d[\"total\"]}')"
```

## Output Format

After running all steps, output a summary table:

```
## Verification Report

| Check                  | Status | Details |
|------------------------|--------|---------|
| TypeScript             | ✅/❌  | X errors |
| Production Build       | ✅/❌  | X routes |
| Database               | ✅/❌  | In sync |
| Home (AR)              | ✅/❌  | 200 |
| Home (EN)              | ✅/❌  | 200 |
| Login                  | ✅/❌  | 200 |
| Register               | ✅/❌  | 200 |
| Find Jobs              | ✅/❌  | 200 |
| Post Job               | ✅/❌  | 200 |
| My Jobs                | ✅/❌  | 200 |
| My Bids                | ✅/❌  | 200 |
| Messages               | ✅/❌  | 200 |
| API /api/jobs          | ✅/❌  | 200 |
| API /api/categories    | ✅/❌  | 200 |
| Auth Protection        | ✅/❌  | 401 |
| Registration Flow      | ✅/❌  | User created |
| Runtime Errors         | ✅/❌  | None |

**Overall: ✅ All checks passed** / **❌ X issues found**
```

If any check fails, list the specific errors and suggest fixes.

## Common Issues and Fixes

| Error | Fix |
|-------|-----|
| `Cannot read properties of undefined (reading 'call')` | Add `"use client"` to the component using Radix UI hooks |
| `MISSING_MESSAGE: Could not resolve` | Add missing key to `messages/ar.json` and `messages/en.json` |
| `RangeError: Invalid time value` | Guard `formatDate()` against null/undefined |
| `mode: "insensitive"` Prisma error | Remove — SQLite doesn't support it |
| `confirmPassword Required` | Ensure form sends `confirmPassword` in request body |
| Build cache stale | Run `rm -rf .next` before `npm run build` |
| Port in use | Kill processes: `kill $(lsof -ti:3000)` |
