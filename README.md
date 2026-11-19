# Five O'Clock Gym

Workout plan and tracker for Vikas and Momin. Step Up Fitness (Mon, Tue, Thu, Fri) and a Cult Andheri East class (Wed), 5–6 PM.

**Live:** https://kdotlamaar-cpu.github.io/gym-plan/
Personal links: `?who=a` (Vikas) · `?who=b` (Momin)

## Stack

- React 18 + TypeScript, built with Vite
- Tailwind CSS 4, Framer Motion, lucide icons, vaul bottom sheets, Recharts
- Zustand for state, saved to the phone's localStorage (no server, no accounts)
- vite-plugin-pwa: installable, works offline, updates itself
- Hosted on GitHub Pages from the `gh-pages` branch

## Screens

| Tab | What it does |
|---|---|
| Today | Today's session and Start button, week strip, quick stats |
| Train | Day tabs, exercise cards with set logging and a rest timer. Wednesday is a one-tap class picker |
| Progress | Weekly weigh-in, weight chart, 8-week consistency grid, best lifts |
| Me | Who uses this phone, plan, diet, gyms, names and weights, share links, install, theme, backup |

## Code layout

```
src/data/program.ts   THE PROGRAM: exercises, sets, reps, rest, photos, gyms, Cult classes
src/data/content.ts   plan, diet and gym-bag text
src/store/data.ts     logs + settings (localStorage, migrates the old site's data)
src/store/timer.ts    rest timer
src/components/       UI kit, app shell, exercise card, class picker
src/screens/          Today, Train, Progress, Me, Plan / Diet / Gyms
public/ex/            exercise photos (free-exercise-db, public domain)
public/*.html         redirects from the old page URLs
```

To change an exercise, edit `src/data/program.ts`.

## Develop and deploy

```bash
npm install
npm run dev       # http://localhost:5173/gym-plan/
npm run deploy    # builds and publishes to the gh-pages branch
```

Commit your source changes to `main` as usual. `npm run deploy` publishes the built site; GitHub Pages picks it up in about a minute.

Data stays on each phone. Use Me → Export / Restore backup to move it between phones.
