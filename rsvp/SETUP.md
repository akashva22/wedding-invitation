# Save RSVPs to a Google Sheet (one-time setup)

1. Create a Google Sheet. Add a tab for the replies (for example named **RSVP**).
2. In that sheet: **Extensions > Apps Script**. Delete the sample code, paste in everything from `google-apps-script.gs`, press **Save**.
3. **Deploy > New deployment > Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**. Deploy, allow the permissions, and copy the **Web app URL** (ends with `/exec`).
4. Open `content/rsvp-config.txt` and fill in:
   - `sheet link:` the sheet's address from the browser
   - `sheet tab name:` (or `sheet number:`) the tab to write into
   - `web app url:` the URL from step 3
   - `rsvp mode:` `sheet` to save only, `both` to save and also open WhatsApp
5. Change the `## Fields` and `## Columns` lists if you want other questions or a different column order.
6. Upload the invitation folder to your web host and test one reply. A new row should appear in the tab.

Notes
- The page cannot read the sheet's answer, so it shows "saved" once the request is sent. Check the sheet after your test.
- If you change `google-apps-script.gs` later, use **Deploy > Manage deployments > Edit > New version**.
- The Web app is public by design (guests need to send replies), but it only ever adds rows to this one spreadsheet.
- Saving to the sheet works on your own hosting. It does not work inside Claude's preview page.
