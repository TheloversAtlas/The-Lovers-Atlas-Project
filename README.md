# THE LOVER'S ATLAS — PARADISE V2

A Replit-ready production upgrade of the Paradise landing page.

## WHAT V2 ADDS

- Server-side Citizen Registry endpoint
- Supabase-ready database connection
- Database-generated unique Citizen IDs (`COTA-000001`, etc.)
- Founding Citizen status for the first 1,000 database records
- Duplicate-email protection
- Live Citizen count from Supabase
- Paradise as the locked entry destination
- UTM/source tracking for Instagram, TikTok, QR campaigns, etc.
- Optional email-marketing consent stored separately from Registry membership
- Rate limiting and a simple bot trap
- Privacy starter page
- `entertheatlas.world` as the campaign/front-door canonical domain
- `theloversatlas.com` referenced as the larger permanent Atlas home
- Supabase service-role key kept on the server, never in browser JavaScript

## FILE MAP

```
Lovers_Atlas_Replit_V2/
├── .replit
├── package.json
├── server.js
├── supabase-setup.sql
├── README.md
└── public/
    ├── index.html
    ├── privacy.html
    ├── styles.css
    ├── script.js
    └── assets/
        ├── lovers-atlas-logo.jpg
        ├── paradise-loop.mp4
        ├── paradise-full.mp4
        ├── paradise-poster.jpg
        ├── passport.png
        ├── citizens-atlas.png
        └── haiti-reference.png
```

# TAKE IT ONE STEP AT A TIME

Do not configure everything at once. Complete each checkpoint before moving on.

## STEP 1 — GET V2 RUNNING IN REPLIT

1. Create a new Replit App.
2. Import/upload the contents of this V2 folder or ZIP.
3. Replit should recognize `package.json`.
4. Press **Run**. Replit will install the dependencies and start `node server.js`.
5. Open the preview.
6. Confirm the Paradise page, video, buttons and artwork appear.

At this stage the page works, but registration will intentionally say the Registry is not connected yet. That is correct.

**Checkpoint:** Do not move to Step 2 until the landing page opens successfully.

## STEP 2 — CREATE THE SUPABASE PROJECT

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Open `supabase-setup.sql` from this package.
4. Copy all of it into a new Supabase SQL query.
5. Run the query once.
6. In **Table Editor**, confirm a table named `citizens` exists.

**Checkpoint:** You should see the empty `citizens` table with columns such as `citizen_number`, `name`, `email`, `destination`, `source`, `founding_citizen`, and `created_at`.

## STEP 3 — CONNECT REPLIT TO SUPABASE

In Replit, use **Secrets / Environment Variables**. Never paste these values into `script.js` or `index.html`.

Add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then restart the Replit app.

Test:

```
/api/health
```

The response should report that the database is configured.

**Security:** The service-role key is intentionally used only by `server.js`. Do not expose it in public browser code or commit it into the project files.

## STEP 4 — TEST A REAL CITIZEN REGISTRATION

1. Open the landing page preview.
2. Register with a test name and email.
3. The site should reveal a Citizen number such as `COTA-000001`.
4. Open Supabase > Table Editor > `citizens`.
5. Confirm the record is there.
6. Register again with the same email. It should return the same Citizen identity instead of creating a duplicate.

## STEP 5 — TEST CAMPAIGN SOURCE TRACKING

Open your page with a URL such as:

```
https://YOUR-REPLIT-URL/?utm_source=instagram&utm_campaign=paradise_launch
```

Register a test Citizen. In Supabase, confirm:

- `source` = `instagram`
- `campaign` = `paradise_launch`
- `destination` = `Paradise`

Later you can create separate links for TikTok, Instagram, QR posters, YouTube, etc.

## STEP 6 — CONNECT `entertheatlas.world`

Do this in Replit's deployment/custom-domain settings and at the company where the domain's DNS is managed. The domain is not connected by putting it in JavaScript.

Recommended role:

- `entertheatlas.world` → Paradise campaign + Citizen Registry front door
- `theloversatlas.com` → long-term master brand/world

The page already uses `https://entertheatlas.world/` as its canonical campaign URL.

Only change DNS using the exact records Replit shows you for your deployment. Do not guess the A/CNAME values.

## STEP 7 — EMAIL SYSTEM (NEXT PHASE)

V2 stores the `email_consent` decision in Supabase but intentionally does **not** send marketing email yet. This lets you verify the Registry before adding another moving part.

Next, connect an email provider such as MailerLite/Kit/etc. so only Citizens who selected the email-updates checkbox are added to Citizen Dispatches.

Recommended first automation:

1. Citizen registers
2. Database creates Citizen number
3. Consenting Citizen is added to the email platform
4. Immediate welcome email: "Welcome to The Lover's Atlas"
5. Citizen number and Paradise entry are included in the message

## BEFORE PUBLIC LAUNCH

- Replace the starter privacy copy with final business/contact information.
- Test on iPhone and Android.
- Test registration from Instagram's in-app browser.
- Confirm duplicate emails do not create duplicate Citizen numbers.
- Confirm UTM source tracking.
- Confirm video loading speed on cellular data.
- Connect the custom domain.
- Add analytics after the registration funnel is stable.
- Add the email platform only after database registration works correctly.

## CORE ARCHITECTURE

```
Paradise clips / QR / social
            ↓
    entertheatlas.world
            ↓
   Paradise landing page
            ↓
      /api/register
            ↓
       Replit server
            ↓
         Supabase
            ↓
 Name + Email + Citizen ID
 Destination + Source + Consent
            ↓
  Passport / Welcome reveal
            ↓
 Email platform (Phase 2)
```
