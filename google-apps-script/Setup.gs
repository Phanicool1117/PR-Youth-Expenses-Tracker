/**
 * ============================================================================
 * PR YOUTH TRACKER — ONE-CLICK DATABASE SETUP & MIGRATION (Setup.gs)
 * Penumuli Perantalamma Youth Team
 * ============================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets > Extensions > Apps Script.
 * 2. Create a file named "Setup.gs" and paste this code.
 * 3. In the top toolbar, select function "setupDatabase" and click "Run".
 * 4. Grant permissions when prompted.
 * 5. All sheets & columns (including G, H, I for Donations) will be created/updated!
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup / Upgrade "Donations" Tab (Columns A to I)
  var donationSheet = getOrCreateSheet(ss, "Donations", [
    "Member ID",
    "Member Name",
    "Donor Name",
    "Payment Method",
    "Amount",
    "Timestamp",
    "Type",
    "Gender",
    "Notes"
  ], "#047857"); // Emerald Header
  
  // 2. Setup / Upgrade "Expenses" Tab
  var expenseSheet = getOrCreateSheet(ss, "Expenses", [
    "Member ID",
    "Member Name",
    "Payment Method",
    "Amount",
    "Timestamp",
    "Category",
    "Note"
  ], "#1e40af"); // Royal Blue Header

  // 3. Setup / Upgrade "Members" Tab
  var memberSheet = getOrCreateSheet(ss, "Members", [
    "Member ID",
    "Name",
    "Password",
    "Role",
    "Active"
  ], "#0f172a"); // Slate Dark Header

  // 4. Setup / Upgrade "Categories" Tab
  var catSheet = getOrCreateSheet(ss, "Categories", [
    "Category Name",
    "Active"
  ], "#d97706"); // Amber Header

  // 5. Setup / Upgrade "Audit_Log" Tab
  var auditSheet = getOrCreateSheet(ss, "Audit_Log", [
    "Timestamp",
    "User ID",
    "User Name",
    "Action",
    "Record Type",
    "Details"
  ], "#475569"); // Charcoal Header

  // Populate Default Members if empty
  if (memberSheet.getLastRow() <= 1) {
    var defaultMembers = [
      ["ADM000", "Admin", "admin123", "Admin", "TRUE"],
      ["PRY001", "Prasad Varma", "prasad123", "Member", "TRUE"],
      ["PRY002", "Suresh Kumar", "suresh123", "Member", "TRUE"],
      ["PRY003", "Ramesh Raju", "ramesh123", "Member", "TRUE"],
      ["PRY004", "Venkatesh", "venky123", "Member", "TRUE"],
      ["PRY005", "Naveen", "naveen123", "Member", "TRUE"]
    ];
    memberSheet.getRange(2, 1, defaultMembers.length, defaultMembers[0].length).setValues(defaultMembers);
  }

  // Populate Default Categories if empty
  if (catSheet.getLastRow() <= 1) {
    var defaultCategories = [
      ["Decoration Expenses", "TRUE"],
      ["Pooja Expenses", "TRUE"],
      ["Crackers Expenses", "TRUE"],
      ["Lights Expenses", "TRUE"],
      ["Travel Expenses", "TRUE"],
      ["Banner Expenses", "TRUE"],
      ["DJ Expenses", "TRUE"],
      ["Food Expenses", "TRUE"],
      ["Water Expenses", "TRUE"],
      ["Vegetables Expenses", "TRUE"],
      ["Other Expenses", "TRUE"]
    ];
    catSheet.getRange(2, 1, defaultCategories.length, defaultCategories[0].length).setValues(defaultCategories);
  }

  Logger.log("✅ Database Setup and 9-Column Donations Migration Completed Successfully!");
}

/**
 * Helper function to create or upgrade sheet with custom styled headers
 */
function getOrCreateSheet(ss, sheetName, headers, headerColor) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Ensure header row exists & is styled
  var currentCols = Math.max(sheet.getLastColumn(), headers.length);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Style Header Row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setFontColor("#ffffff");
  headerRange.setBackground(headerColor || "#0f52ba");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  // Auto-resize columns for clean reading
  for (var i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i), 130));
  }

  return sheet;
}
