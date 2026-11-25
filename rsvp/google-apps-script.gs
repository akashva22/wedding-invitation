/**
 * RSVP connector for the wedding invitation.
 *
 * Paste this whole file into the Google Sheet that should receive the replies:
 *   Sheet > Extensions > Apps Script > replace the code > Save
 *   Deploy > New deployment > type: Web app
 *     Execute as: Me      Who has access: Anyone
 *   Copy the Web app URL (ends with /exec) into content/rsvp-config.txt -> "web app url".
 *
 * Which tab, which columns and which fields are used is decided by content/rsvp-config.txt,
 * so you normally never need to edit this file again. After changing THIS file, deploy a new version.
 */

var MAX_ROWS = 1000;      // stops the sheet from filling up with junk
var MAX_FIELD_LENGTH = 500;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var req = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Safety: only write to the spreadsheet this script belongs to.
    if (req.sheetId && req.sheetId !== ss.getId()) {
      return reply({ ok: false, error: "The sheet link in rsvp-config.txt does not match this spreadsheet." });
    }
    var sheet = pickSheet(ss, req.tab || {});
    if (!sheet) return reply({ ok: false, error: "Tab not found." });

    if (sheet.getLastRow() >= MAX_ROWS) return reply({ ok: false, error: "Row limit reached." });
    var data = {};
    Object.keys(req.data || {}).forEach(function (k) { data[k] = String(req.data[k]).slice(0, MAX_FIELD_LENGTH); });
    var stamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var cols = req.columns || [];
    if (!cols.length) return reply({ ok: false, error: "No columns configured." });

    var row = cols.map(function (c) {
      var v = String(c.value || "").replace(/\{(\w+)\}/g, function (m, key) {
        if (key === "timestamp") return stamp;
        return data[key] !== undefined ? data[key] : "";
      });
      return safe(v);
    });

    if (req.writeHeader && sheet.getLastRow() === 0) {
      sheet.appendRow(cols.map(function (c) { return c.header; }));
    }
    sheet.appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() {
  return ContentService.createTextOutput("RSVP connector is running.");
}

// Tab by name, else by number (1 = first tab), else by gid from the sheet link.
function pickSheet(ss, tab) {
  var s = null;
  if (tab.name) s = ss.getSheetByName(tab.name);
  if (!s && tab.number) s = ss.getSheets()[Number(tab.number) - 1] || null;
  if (!s && tab.gid !== "" && tab.gid !== undefined) {
    ss.getSheets().forEach(function (x) { if (String(x.getSheetId()) === String(tab.gid)) s = x; });
  }
  return s;
}

// Stop guests from typing spreadsheet formulas.
function safe(v) {
  return /^[=@]|^[+\-][^0-9\s]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
