/**
 * PR Youth — Google Sheets Setup Script
 * Penumuli Perantalamma Youth Team
 * 
 * - Admin_Overview tab has 2 clean columns: Metric/Name & Live Amount (₹).
 * - Dynamically builds Category Breakdown from Categories tab in Google Sheets.
 */

function setupPRYouthSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Members Tab: Member ID | Name | Password | Role | Active
  var membersSheet = getOrCreateSheet(ss, "Members");
  if (membersSheet.getLastRow() === 0) {
    membersSheet.appendRow(["Member ID", "Name", "Password", "Role", "Active"]);
    membersSheet.appendRow(["ADM000", "Admin", "admin123", "Admin", "TRUE"]);
    membersSheet.appendRow(["PRY001", "Phani", "001", "Member", "TRUE"]);
    membersSheet.appendRow(["PRY002", "Ravi", "002", "Member", "TRUE"]);
    membersSheet.appendRow(["PRY003", "Suresh", "003", "Member", "TRUE"]);
    membersSheet.appendRow(["PRY004", "Venkat", "004", "Member", "TRUE"]);
    formatHeaderRow(membersSheet);
  }

  // 2. Donations Tab (Admin Central Collections): Member ID | Member Name | Donor Name | Payment Method | Amount | Timestamp
  var donationsSheet = getOrCreateSheet(ss, "Donations");
  if (donationsSheet.getLastRow() === 0) {
    donationsSheet.appendRow(["Member ID", "Member Name", "Donor Name", "Payment Method", "Amount", "Timestamp"]);
    donationsSheet.appendRow(["ADM000", "Admin", "K. Ramesh", "UPI", 10000, new Date().toISOString()]);
    donationsSheet.appendRow(["ADM000", "Admin", "M. Srinivas", "Cash", 5000, new Date().toISOString()]);
    donationsSheet.appendRow(["ADM000", "Admin", "G. Prasad", "UPI", 8000, new Date().toISOString()]);
    formatHeaderRow(donationsSheet);
  }

  // 3. Expenses Tab (Committee Member Out of Pocket): Member ID | Member Name | Payment Method | Amount | Timestamp | Category | Note
  var expensesSheet = getOrCreateSheet(ss, "Expenses");
  if (expensesSheet.getLastRow() === 0) {
    expensesSheet.appendRow(["Member ID", "Member Name", "Payment Method", "Amount", "Timestamp", "Category", "Note"]);
    expensesSheet.appendRow(["PRY001", "Phani", "Cash", 2500, new Date().toISOString(), "Decoration Expenses", "Flowers & Light strings"]);
    expensesSheet.appendRow(["PRY002", "Ravi", "Cash", 1200, new Date().toISOString(), "Pooja Expenses", "Pooja Samagri & Fruits"]);
    expensesSheet.appendRow(["PRY003", "Suresh", "Cash", 4500, new Date().toISOString(), "Crackers Expenses", "Fireworks & Sparklers"]);
    formatHeaderRow(expensesSheet);
  }

  // 4. Categories Tab: Category | Active
  var catSheet = getOrCreateSheet(ss, "Categories");
  if (catSheet.getLastRow() === 0) {
    catSheet.appendRow(["Category", "Active"]);
    var defaultCats = [
      "Travel Expenses",
      "Crackers Expenses",
      "Lights Expenses",
      "Banner Expenses",
      "Decoration Expenses",
      "Pooja Expenses",
      "DJ Expenses",
      "Prasadam Expenses",
      "Other Expenses",
      "Water Expenses"
    ];
    for (var c = 0; c < defaultCats.length; c++) {
      catSheet.appendRow([defaultCats[c], "TRUE"]);
    }
    formatHeaderRow(catSheet);
  }

  // 5. Audit_Log Tab
  var auditSheet = getOrCreateSheet(ss, "Audit_Log");
  if (auditSheet.getLastRow() === 0) {
    auditSheet.appendRow(["Timestamp", "User ID", "User Name", "Action", "Record Type", "Details"]);
    auditSheet.appendRow([new Date().toISOString(), "SYSTEM", "System Setup", "Initialize", "System", "PR Youth Sheets initialized successfully"]);
    formatHeaderRow(auditSheet);
  }

  // 6. Admin_Overview Tab (DYNAMIC 2-COLUMN LIVE MONITORING DASHBOARD)
  setupAdminOverviewTab(ss);

  if (SpreadsheetApp.getUi()) {
    SpreadsheetApp.getUi().alert("PR Youth Sheets & Admin_Overview monitoring setup completed successfully!");
  }
}

function setupAdminOverviewTab(ss) {
  var overviewSheet = getOrCreateSheet(ss, "Admin_Overview");
  overviewSheet.clear();
  
  // Section 1: Title Banner
  overviewSheet.getRange("A1:B1").merge().setValue("PR YOUTH COMMITTEE — EXECUTIVE MONITORING DASHBOARD")
    .setFontWeight("bold").setFontSize(13).setBackground("#1d1d1f").setFontColor("#ffffff").setHorizontalAlignment("center");

  // Section 2: Key Financial Metrics (2 Columns)
  overviewSheet.appendRow(["KEY FINANCIAL METRICS", ""]);
  overviewSheet.appendRow(["Metric Name", "Live Amount"]);
  overviewSheet.appendRow(["Total Donations Collected (Admin)", '=SUM(Donations!E2:E)']);
  overviewSheet.appendRow(["Total Expenses Paid (Members)", '=SUM(Expenses!D2:D)']);
  overviewSheet.appendRow(["Current Net Balance", '=B4-B5']);
  overviewSheet.appendRow(["", ""]);

  // Section 3: Donation Payment Method Breakdown (2 Columns)
  overviewSheet.appendRow(["DONATION PAYMENT METHOD BREAKDOWN", ""]);
  overviewSheet.appendRow(["Payment Method", "Live Amount (₹)"]);
  overviewSheet.appendRow(["Cash Donations", '=SUMIF(Donations!D2:D, "Cash", Donations!E2:E)']);
  overviewSheet.appendRow(["UPI Donations", '=SUMIF(Donations!D2:D, "UPI", Donations!E2:E)']);
  overviewSheet.appendRow(["Other Donations", '=SUMIF(Donations!D2:D, "Other", Donations!E2:E)']);
  overviewSheet.appendRow(["", ""]);

  // Section 4: Dynamic Expense Category Breakdown (2 Columns)
  overviewSheet.appendRow(["EXPENSE CATEGORY BREAKDOWN", ""]);
  overviewSheet.appendRow(["Category Name", "Live Amount (₹)"]);
  
  var catSheet = ss.getSheetByName("Categories");
  var categories = [];
  
  if (catSheet && catSheet.getLastRow() > 1) {
    var catData = catSheet.getDataRange().getValues();
    for (var r = 1; r < catData.length; r++) {
      var cName = catData[r][0];
      var activeStr = String(catData[r][1] !== undefined ? catData[r][1] : 'TRUE').toUpperCase();
      if (cName && (activeStr === 'TRUE' || activeStr === '1' || activeStr === '')) {
        categories.push(String(cName).trim());
      }
    }
  }

  if (categories.length === 0) {
    categories = [
      "Travel Expenses",
      "Crackers Expenses",
      "Lights Expenses",
      "Banner Expenses",
      "Decoration Expenses",
      "Pooja Expenses",
      "DJ Expenses",
      "Prasadam Expenses",
      "Other Expenses",
      "Water Expenses"
    ];
  }

  for (var i = 0; i < categories.length; i++) {
    var catName = categories[i];
    overviewSheet.appendRow([catName, '=SUMIF(Expenses!F2:F, "' + catName + '", Expenses!D2:D)']);
  }

  // Formatting (Clean 2-Column Styles)
  overviewSheet.getRange("A2:B2").setFontWeight("bold").setBackground("#0071e3").setFontColor("#ffffff");
  overviewSheet.getRange("A3:B3").setFontWeight("bold").setBackground("#e2e2e5");
  overviewSheet.getRange("B4:B6").setNumberFormat("₹#,##0.00").setFontWeight("bold");

  overviewSheet.getRange("A8:B8").setFontWeight("bold").setBackground("#0071e3").setFontColor("#ffffff");
  overviewSheet.getRange("A9:B9").setFontWeight("bold").setBackground("#e2e2e5");
  overviewSheet.getRange("B10:B12").setNumberFormat("₹#,##0.00");

  var catStartRow = 14;
  var catEndRow = catStartRow + categories.length + 1;
  overviewSheet.getRange(catStartRow, 1, 1, 2).setFontWeight("bold").setBackground("#0071e3").setFontColor("#ffffff");
  overviewSheet.getRange(catStartRow + 1, 1, 1, 2).setFontWeight("bold").setBackground("#e2e2e5");
  overviewSheet.getRange(catStartRow + 2, 2, categories.length, 1).setNumberFormat("₹#,##0.00");

  overviewSheet.setColumnWidth(1, 300);
  overviewSheet.setColumnWidth(2, 200);
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setFontWeight("bold");
  range.setBackground("#f0f4f8");
  sheet.setFrozenRows(1);
}
