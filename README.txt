BPBL Pro — stability and homepage update (October 31, 2026)

REPLACE these four files in the main branch of your GitHub repository:
- index.html
- app.js
- data.js
- assets.js

Do not upload the ZIP itself. Extract the ZIP and upload these four files to the top level of the repository. Commit changes.

Changes:
- Fixes script load order to initialize after all elements exist
- League Leaders renders immediately without an extra click
- Keeps selected page on refresh using URL hash and session storage
- Makes Home more useful: four clickable current matchups, featured award posters, quick stats, standings and scoring leader
- Preserves 60 results, 60 game box-score entries, logo and 40 award posters

TEST:
1. Load website in a private tab, open League Leaders: player table appears without clicking filters
2. Select 'Per Game', verify rankings change
3. Open Previous Matchups, select a game, view score and player box score
4. Refresh Previous Matchups; the same tab remains selected
5. Return Home, confirm latest results and three award photos render
