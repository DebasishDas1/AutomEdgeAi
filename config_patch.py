# config_patch.py
# ── PATCH FOR RENDER DEPLOYMENT ───────────────────────────────────────────────
# Render free tier has no persistent disk — you cannot store credential files.
# Replace FIREBASE_CREDENTIALS_PATH and SHEETS_CREDENTIALS_PATH in config.py
# with JSON string env vars, then load them at runtime.
#
# 1. In core/config.py replace:
#       FIREBASE_CREDENTIALS_PATH: str
#       SHEETS_CREDENTIALS_PATH: str
#    with:
#       FIREBASE_CREDENTIALS_JSON: str = ""   # full JSON string
#       SHEETS_CREDENTIALS_JSON:   str = ""   # full JSON string
#
# 2. Wherever you initialise Firebase Admin, replace:
#       cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
#    with:
#       import json
#       cred = credentials.Certificate(
#           json.loads(settings.FIREBASE_CREDENTIALS_JSON)
#       )
#
# 3. Wherever you initialise gspread, replace:
#       gc = gspread.service_account(filename=settings.SHEETS_CREDENTIALS_PATH)
#    with:
#       import json
#       gc = gspread.service_account_from_dict(
#           json.loads(settings.SHEETS_CREDENTIALS_JSON)
#       )
#
# HOW TO SET THE JSON STRING IN RENDER:
#   cat your-firebase-key.json | pbcopy   (macOS) — paste into Render env var
#   The entire JSON including braces goes in as a single-line string value.