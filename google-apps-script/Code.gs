/**
 * PR Youth — Google Apps Script API Backend
 * Penumuli Perantalamma Youth Team
 * - Members record out-of-pocket Expenses.
 * - Admin centrally records received Donations.
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = { success: false, message: "Invalid request" };
  
  try {
    var params = {};
    if (e && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      params = e.parameter;
    }
    
    var action = params.action;
    
    switch (action) {
      case 'ping':
        output = { success: true, message: "PR Youth API is running live!" };
        break;
        
      case 'login':
        output = loginUser(params.usernameOrId, params.password);
        break;
        
      case 'getMemberDashboard':
        output = getMemberDashboard(params.memberId);
        break;
        
      case 'addExpense':
        output = addExpense(params);
        break;

      case 'addDonation':
        output = addDonation(params); // Admin Only
        break;

      case 'toggleMemberStatus':
        output = toggleMemberStatus(params.memberId, params.status);
        break;
        
      case 'getMyActivity':
        output = getMyActivity(params.memberId);
        break;
        
      case 'getAdminDashboard':
        output = getAdminDashboard();
        break;

      case 'getAllDonations':
        output = getAllDonations();
        break;
        
      case 'getAllExpenses':
        output = getAllExpenses();
        break;
        
      case 'getMembers':
        output = getMembersSummary();
        break;
        
      case 'getCategories':
        output = getActiveCategories();
        break;

      default:
        output = { success: false, message: "Unknown action: " + action };
    }
  } catch (err) {
    output = { success: false, message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheetData(sheetName) {
  var sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

function logAudit(userId, userName, action, recordType, details) {
  try {
    var sheet = getSpreadsheet().getSheetByName("Audit_Log");
    if (sheet) {
      sheet.appendRow([
        new Date().toISOString(),
        userId || '',
        userName || '',
        action || '',
        recordType || '',
        details || ''
      ]);
    }
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

function loginUser(usernameOrId, password) {
  if (!usernameOrId || !password) {
    return { success: false, message: "Username/ID and password are required." };
  }
  
  var members = getSheetData("Members");
  var user = null;
  
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    var idMatch = String(m['Member ID']).toLowerCase() === String(usernameOrId).toLowerCase();
    var nameMatch = String(m['Name']).toLowerCase() === String(usernameOrId).toLowerCase();
    var userMatch = m['Username'] ? String(m['Username']).toLowerCase() === String(usernameOrId).toLowerCase() : false;
    
    if (idMatch || nameMatch || userMatch) {
      user = m;
      break;
    }
  }
  
  if (!user) {
    return { success: false, message: "Invalid credentials." };
  }
  
  var activeVal = String(user['Active']).toLowerCase();
  var isActive = activeVal === 'true' || activeVal === 'active' || activeVal === '1';
  if (!isActive) {
    return { success: false, message: "Your account is deactivated. Please contact administrator." };
  }
  
  var storedPass = String(user['Password'] !== undefined ? user['Password'] : user['Password Hash']);
  if (storedPass !== String(password)) {
    return { success: false, message: "Invalid credentials." };
  }
  
  logAudit(user['Member ID'], user['Name'], 'Login', 'Auth', 'User logged in successfully');
  
  return {
    success: true,
    user: {
      memberId: user['Member ID'],
      name: user['Name'],
      username: user['Name'],
      role: user['Role'],
      active: true,
      status: 'Active'
    }
  };
}

function toggleMemberStatus(memberId, newStatus) {
  if (!memberId || !newStatus) {
    return { success: false, message: "Member ID and new status required." };
  }

  var sheet = getSpreadsheet().getSheetByName("Members");
  if (!sheet) return { success: false, message: "Members sheet not found." };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var activeColIdx = -1;
  var idColIdx = -1;

  for (var j = 0; j < headers.length; j++) {
    if (String(headers[j]).toLowerCase() === 'active') activeColIdx = j;
    if (String(headers[j]).toLowerCase() === 'member id') idColIdx = j;
  }

  if (activeColIdx === -1 || idColIdx === -1) {
    return { success: false, message: "Member columns not found." };
  }

  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]).toLowerCase() === String(memberId).toLowerCase()) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: "Member ID not found in sheet." };
  }

  var isAct = newStatus.toLowerCase() === 'active';
  sheet.getRange(targetRow, activeColIdx + 1).setValue(isAct ? 'TRUE' : 'FALSE');

  logAudit('ADM000', 'Admin', 'Toggle Member Status', 'Member', memberId + ' set to ' + newStatus);

  return { success: true, message: "Member status updated to " + newStatus };
}

function getMemberDashboard(memberId) {
  if (!memberId) return { success: false, message: "Member ID required." };
  
  var expenses = getSheetData("Expenses").filter(function(e) {
    return String(e['Member ID']) === String(memberId);
  });
  
  var totalExpenses = 0;
  for (var j = 0; j < expenses.length; j++) {
    totalExpenses += Number(expenses[j]['Amount']) || 0;
  }
  
  var activity = getMyActivity(memberId).data || [];
  
  return {
    success: true,
    data: {
      totalExpenses: totalExpenses,
      expenseCount: expenses.length,
      recentActivity: activity.slice(0, 10)
    }
  };
}

function addDonation(params) {
  var memberId = params.memberId || 'ADM000';
  var memberName = params.memberName || 'Admin';
  var donorName = params.donorName || params.name || params.donor || '';
  var amount = Number(params.amount);
  var paymentMethod = params.paymentMethod || params.paymentMode || 'Cash';
  var date = params.date || new Date().toISOString();
  
  if (!donorName || !amount || isNaN(amount) || amount <= 0) {
    return { success: false, message: "Invalid donation entry. Check required fields and amount." };
  }
  
  var sheet = getSpreadsheet().getSheetByName("Donations");
  if (!sheet) return { success: false, message: "Donations sheet not found." };
  
  var timestamp = new Date().toISOString();
  
  // Append to Donations sheet
  sheet.appendRow([
    memberId,
    memberName,
    donorName,
    paymentMethod,
    amount,
    timestamp
  ]);
  
  logAudit(memberId, memberName, 'Add Donation (Admin)', 'Donation', 'Donor: ' + donorName + ' | Amount: ₹' + amount + ' | Method: ' + paymentMethod);
  
  return { success: true, message: "Central donation recorded successfully!" };
}

function addExpense(params) {
  var memberId = params.memberId;
  var memberName = params.memberName;
  var amount = Number(params.amount);
  var category = params.category;
  var note = params.note || '';
  var paymentMethod = params.paymentMethod || 'Cash';
  
  if (!memberId || !memberName || !amount || isNaN(amount) || amount <= 0 || !category) {
    return { success: false, message: "Invalid expense entry." };
  }
  
  var sheet = getSpreadsheet().getSheetByName("Expenses");
  if (!sheet) return { success: false, message: "Expenses sheet not found." };
  
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    memberId,
    memberName,
    paymentMethod,
    amount,
    timestamp,
    category,
    note
  ]);
  
  logAudit(memberId, memberName, 'Add Expense', 'Expense', 'Amount: ₹' + amount + ' | Category: ' + category);
  
  return { success: true, message: "Expense added successfully!" };
}

function getMyActivity(memberId) {
  var expenses = getSheetData("Expenses").filter(function(e) {
    return !memberId || String(e['Member ID']) === String(memberId);
  }).map(function(e) {
    return {
      type: 'Expenses',
      memberId: e['Member ID'],
      memberName: e['Member Name'],
      paymentMethod: e['Payment Method'],
      amount: Number(e['Amount']) || 0,
      timestamp: e['Timestamp'],
      category: e['Category'],
      note: e['Note']
    };
  });
  
  expenses.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return { success: true, data: expenses };
}

function getAdminDashboard() {
  var donations = getSheetData("Donations");
  var expenses = getSheetData("Expenses");
  
  var totalDonations = 0;
  var cashDonations = 0;
  var upiDonations = 0;
  var otherDonations = 0;
  
  for (var i = 0; i < donations.length; i++) {
    var amt = Number(donations[i]['Amount']) || 0;
    totalDonations += amt;
    var pm = String(donations[i]['Payment Method']).toUpperCase();
    if (pm === 'CASH') cashDonations += amt;
    else if (pm === 'UPI') upiDonations += amt;
    else otherDonations += amt;
  }
  
  var totalExpenses = 0;
  var categoryBreakdown = {};
  
  for (var j = 0; j < expenses.length; j++) {
    var expAmt = Number(expenses[j]['Amount']) || 0;
    totalExpenses += expAmt;
    var cat = expenses[j]['Category'] || 'Other Expenses';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + expAmt;
  }
  
  var balance = totalDonations - totalExpenses;
  var activity = getMyActivity('').data || [];
  
  return {
    success: true,
    data: {
      totalDonations: totalDonations,
      totalExpenses: totalExpenses,
      currentBalance: balance,
      paymentBreakdown: {
        cash: cashDonations,
        upi: upiDonations,
        other: otherDonations
      },
      categoryBreakdown: categoryBreakdown,
      recentActivity: activity.slice(0, 15)
    }
  };
}

function getAllDonations() {
  var rows = getSheetData("Donations").map(function(d) {
    return {
      memberId: d['Member ID'],
      memberName: d['Member Name'],
      donorName: d['Donor Name'],
      paymentMethod: d['Payment Method'],
      amount: Number(d['Amount']) || 0,
      timestamp: d['Timestamp']
    };
  });
  rows.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  return { success: true, data: rows };
}

function getAllExpenses() {
  var rows = getSheetData("Expenses").map(function(e) {
    return {
      memberId: e['Member ID'],
      memberName: e['Member Name'],
      paymentMethod: e['Payment Method'],
      amount: Number(e['Amount']) || 0,
      timestamp: e['Timestamp'],
      category: e['Category'],
      note: e['Note']
    };
  });
  rows.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  return { success: true, data: rows };
}

function getMembersSummary() {
  var members = getSheetData("Members");
  var expenses = getSheetData("Expenses");
  
  var result = [];
  
  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    var mId = m['Member ID'];
    var mName = m['Name'];
    var role = m['Role'] || 'Member';
    
    var mExpenses = expenses.filter(function(e) { return String(e['Member ID']) === String(mId); });
    
    var totalExpenses = 0;
    for (var e = 0; e < mExpenses.length; e++) {
      totalExpenses += Number(mExpenses[e]['Amount']) || 0;
    }
    
    var lastActivity = null;
    if (mExpenses.length > 0) {
      mExpenses.sort(function(a, b) { return new Date(b['Timestamp']) - new Date(a['Timestamp']); });
      lastActivity = mExpenses[0]['Timestamp'];
    }

    var activeVal = String(m['Active']).toLowerCase();
    var isAct = activeVal === 'true' || activeVal === 'active' || activeVal === '1';
    
    result.push({
      memberId: mId,
      name: mName,
      role: role,
      active: isAct,
      status: isAct ? 'Active' : 'Inactive',
      totalExpenses: totalExpenses,
      expenseCount: mExpenses.length,
      lastActivity: lastActivity
    });
  }
  
  return { success: true, data: result };
}

function getActiveCategories() {
  var rows = getSheetData("Categories");
  var activeCats = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i]['Active']).toLowerCase() === 'true') {
      activeCats.push(rows[i]['Category']);
    }
  }
  return { success: true, data: activeCats };
}
