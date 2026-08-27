// Initial mock database state for PR Youth Expense Tracker

export const DEFAULT_MEMBERS = [
  { memberId: 'ADM000', name: 'Admin', username: 'admin', role: 'Admin', active: true, passwordHash: 'admin123' },
  { memberId: 'PRY001', name: 'Phani', username: 'phani', role: 'Member', active: true, passwordHash: '001' },
  { memberId: 'PRY002', name: 'Ravi', username: 'ravi', role: 'Member', active: true, passwordHash: '002' },
  { memberId: 'PRY003', name: 'Suresh', username: 'suresh', role: 'Member', active: true, passwordHash: '003' },
  { memberId: 'PRY004', name: 'Venkat', username: 'venkat', role: 'Member', active: true, passwordHash: '004' },
];

export const DEFAULT_CATEGORIES = [
  'Travel Expenses',
  'Crackers Expenses',
  'Lights Expenses',
  'Banner Expenses',
  'Decoration Expenses',
  'Pooja Expenses',
  'DJ Expenses',
  'Prasadam Expenses',
  'Other Expenses',
];

export const DEFAULT_EXPENSES = [
  {
    id: 'EXP-1',
    memberId: 'PRY001',
    memberName: 'Phani',
    type: 'Expenses',
    paymentMethod: 'Cash',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    amount: 2500,
    category: 'Decoration Expenses',
    note: 'Flowers & Light strings for Mandapam',
  },
  {
    id: 'EXP-2',
    memberId: 'PRY002',
    memberName: 'Ravi',
    type: 'Expenses',
    paymentMethod: 'Cash',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    amount: 1200,
    category: 'Pooja Expenses',
    note: 'Pooja Samagri, Coconuts & Fruits',
  },
  {
    id: 'EXP-3',
    memberId: 'PRY003',
    memberName: 'Suresh',
    type: 'Expenses',
    paymentMethod: 'Cash',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    amount: 4500,
    category: 'Crackers Expenses',
    note: 'Welcoming Fireworks & Crackers',
  },
];
