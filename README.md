# scamcatch

Zero-reach scam firewall demo for seniors and family caregivers. Pure HTML/CSS/JS, no build step.

Run: open index.html, or serve the folder (npx serve .). GitHub Pages: Settings > Pages > deploy from main / root.

Modes
Family Mode → registration → add parent → Guardian view (Rina). Sees threat details, can Allow/Block held messages, and can turn on Auto-block for the senior. Also has Privacy and consent (pause, revoke, export data).
Care Mode → Senior view (Nanay). No threat categories or message contents, only numbers, times and status. Blocked items in History have Not a scam, which allows that number next time and shows as flagged in Rina's Tracker.

Use Demo tools on the Firewall tab to simulate incoming calls/SMS (cycles scam, phishing link, uncertain, safe). State lives in localStorage; Reset clears it.

To do
Set the real Care Specialist number (CARE_LINE in app.js).
Replace the simulated consent and scam verdicts with a real backend.
