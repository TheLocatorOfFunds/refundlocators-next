# Deploying refundlocators-next

## Current state (2026-04-28, 15:35 EDT) — ✅ auto-deploy WORKING

Both `refundlocators-next` AND `ohio-intel` Vercel projects are now connected to their GitHub repos. Pushes to `main` auto-deploy within ~30-60 seconds.

This doc is preserved as a reference in case the integration ever breaks again — see "Fixing the auto-deploy" below for the recovery path.

## What was wrong (resolved)

Earlier on 2026-04-28, Vercel had no Git integration configured for either project. `vercel project inspect` showed no Git section, and `vercel git connect` failed because the Vercel-for-GitHub app wasn't installed on the `TheLocatorOfFunds` GitHub user account. Pushes silently sat on `main` while production stayed on whatever was last `vercel --prod`-ed manually.

**Resolution:** Nathan installed the Vercel GitHub App on `TheLocatorOfFunds` and clicked "Connect Git Repository" in each project's Vercel settings. Done in ~5 min.

## Manual deploy after every push (the workaround)

After committing + pushing, run:

```bash
cd ~/Documents/Claude/refundlocators-next
vercel --prod --yes
```

Takes ~30-60 seconds. When it finishes, the new code is live at `https://refundlocators.com`.

If you forget this, the live site stays on whatever was last deployed (which could be hours or days behind `main`).

## Fixing the auto-deploy (Nathan does this once, ~3 minutes)

### Step 1 — Make sure the Vercel-for-GitHub app has access to the account

`TheLocatorOfFunds` on GitHub is a **personal user account, not an organization**. So app installations live at the user-settings URL, not an org-settings URL.

1. **Sign into GitHub as `TheLocatorOfFunds`** (if you have multiple GitHub identities, switch profile first — `https://github.com/login` → make sure the avatar shows TheLocatorOfFunds in the top-right)
2. Open https://github.com/settings/installations
3. Look for **Vercel** in the list
4. If not present → install: https://github.com/apps/vercel → click **Install** → select **TheLocatorOfFunds** (the user, not an org)
5. If present but limited → click **Configure** → under "Repository access" pick **All repositories** OR explicitly add `refundlocators-next`
6. **Save**

### Step 2 — Connect the project to the repo

1. Open https://vercel.com/thelocatoroffunds-projects/refundlocators-next/settings/git
2. Should now show a "Connect Git Repository" prompt
3. Pick **TheLocatorOfFunds/refundlocators-next** → **Production Branch: `main`**
4. **Save**

### Step 3 — Verify

```bash
cd ~/Documents/Claude/refundlocators-next
echo "# auto-deploy test $(date)" >> DEPLOY.md
git add DEPLOY.md && git commit -m "test: confirm auto-deploy after Git reconnection" && git push
```

Then wait ~90 seconds and run:

```bash
vercel ls --yes | head -3
```

The most recent deployment's age should be `<90s` (your test triggered it).

If yes → auto-deploy is fixed, delete this `DEPLOY.md` workaround doc.
If no → recheck Step 1 (most common reason: the Vercel-for-GitHub app installation got denied or got removed at some point).

## Why this matters

Without auto-deploy, work like:
- Castle Claude's hotpatch to `/admin/train` for the Lauren team-chat refactor (today)
- Future Lauren or marketing-site changes
- Bug fixes that need to ship fast

… all sit on `main` invisibly until someone remembers to run `vercel --prod`. Easy to forget; impossible to notice unless the live site is being actively tested.

## Same issue on other Vercel projects?

Check each:

```bash
cd ~/Documents/Claude/<project> && vercel project inspect 2>&1 | grep -i git
```

If it shows no `Git Repository` line, that project has the same problem.

Known Vercel projects in the FundLocators stack:
- `refundlocators-next` — broken (this doc)
- `ohio-intel` — status: ✅ auto-deploys (verified during the UI bake-off — pushes to feature branches auto-built preview URLs)
