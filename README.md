# Five O'Clock Gym Plan

A mobile-first training plan and workout tracker for a Monday–Friday, 5–6 PM routine:
four strength sessions at Step Up Fitness (Vile Parle East) and one class at Cult Andheri East.

It's plain HTML, CSS and JavaScript with no build step. It installs on a phone like an app (PWA) and works offline once it's hosted.

## Pages

| Page | What's on it |
|---|---|
| `index.html` | **Today**: greeting, today's session with a Start button, weekly stats, this week's board |
| `workouts.html` | Each workout with start/finish **exercise photos**, sets, reps, rest, tips, back-friendly swaps, warm-up and cool-down |
| `tracker.html` | **Log**: set-by-set kg × reps, last week's numbers, a rest timer (vibrate + beep), finish-workout summary |
| `progress.html` | Weekly weigh-in, bodyweight-change chart (with a table view), 8-week consistency grid, best lifts |
| `diet.html` | Calorie and protein targets, meal timing, protein sources, sample days |
| `schedule.html` | Weekly layout, daily timeline, 6-week block |
| `cult.html` | Wednesday class: Boxing ↔ HRX / S&C rotation, booking, what to bring |
| `guide.html` | Progression, effort levels, deloads, back care, recovery, gym bag |
| `gyms.html` | Addresses, hours, maps, sources |
| `settings.html` | Who uses this phone, names, start date, backup / restore, install help |

On phones the app shows a bottom tab bar (Today · Workouts · Log · Progress · More). On desktop it shows a top menu.

## Project layout

```
*.html                    one file per page
manifest.webmanifest      app name, icons, colours (for "Add to Home Screen")
sw.js                     service worker: offline cache
assets/css/style.css      all styles (light + dark)
assets/js/data.js         THE PROGRAM: exercises, sets, reps, rest, photos, gyms, Cult rotation
assets/js/store.js        tracker storage (localStorage) + export/import
assets/js/layout.js       header, tab bar, More sheet, theme, offline registration
assets/js/home.js | workouts.js | tracker.js | progress.js | settings.js   page logic
assets/img/ex/            exercise photos (start = -0.jpg, finish = -1.jpg)
assets/icons/             app icons
```

To change an exercise, its sets, reps, rest time or photo, edit `assets/js/data.js`. Every page reads from it.

## Data

- Logs are saved in each phone's browser (`localStorage`). There's no server.
- **Settings → This phone belongs to** sets who the Log page and Today stats are for.
- **Settings → Export backup** downloads a `.json` file. **Import backup** loads it on another phone and replaces that phone's data. Use this to share logs with your partner or move to a new phone.
- Clearing browser data deletes the logs, so export now and then.

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `gym-plan`.
2. From this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Five O'Clock Gym Plan"
   git branch -M main
   git remote add origin https://github.com/<your-username>/gym-plan.git
   git push -u origin main
   ```
3. On GitHub, open **Settings → Pages**. Set **Source: Deploy from a branch**, **Branch: `main`** and **folder: `/ (root)`**, then save.
4. After a minute the site is live at `https://<your-username>.github.io/gym-plan/`.
5. On each phone, open that link and install it:
   - **Android (Chrome):** ⋮ → **Install app**
   - **iPhone (Safari):** Share → **Add to Home Screen**

### Updating later

After you change files and push, phones pick up the new version on their next visit or two. To force everyone onto it straight away, change `VERSION` at the top of `sw.js` (e.g. `fogp-v2`) before you push.

## Credits

Exercise photos: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), public domain (Unlicense).
Gym details from cult.fit listings (Nov 2026). Diet figures are general fitness guidance, not medical advice.
