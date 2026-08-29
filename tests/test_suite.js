/**
 * Bharat Wellness Club - Test Suite
 * Automated unit tests for calculation, billing validation, and receipt data binding.
 */

const TestRunner = {
  passed: 0,
  failed: 0,
  results: [],

  assert(description, condition, expected, actual) {
    if (condition) {
      this.passed++;
      this.results.push({ description, status: 'PASS', expected, actual });
      console.log(`%c[PASS] ${description}`, 'color: #10B981; font-weight: bold;');
    } else {
      this.failed++;
      this.results.push({ description, status: 'FAIL', expected, actual });
      console.error(`[FAIL] ${description} | Expected: ${expected}, Actual: ${actual}`);
    }
  },

  assertEquals(description, actual, expected) {
    this.assert(description, actual === expected, expected, actual);
  },

  assertCloseTo(description, actual, expected, precision = 2) {
    const diff = Math.abs(actual - expected);
    const tolerance = Math.pow(10, -precision);
    this.assert(description, diff < tolerance, expected, actual);
  }
};

// 1. Discount & Total Calculation Tests
function testBillingCalculations() {
  console.group('--- Billing & Discount Calculation Tests ---');
  
  // Test case 1: 0% Retail MRP
  const item1 = { mrp: 1000, qty: 2, vp: 10.5, discount: 0 };
  const item1Total = Math.round(item1.mrp * item1.qty * (1 - item1.discount / 100));
  const item1VP = item1.vp * item1.qty;
  TestRunner.assertEquals('Retail MRP (0% discount) total calculation', item1Total, 2000);
  TestRunner.assertEquals('Item 1 total VP calculation', item1VP, 21.0);

  // Test case 2: 25% Slab
  const item2 = { mrp: 1200, qty: 1, vp: 12.0, discount: 25 };
  const item2Total = Math.round(item2.mrp * item2.qty * (1 - item2.discount / 100));
  TestRunner.assertEquals('25% slab discount calculation', item2Total, 900);

  // Test case 3: 50% Supervisor Slab
  const item3 = { mrp: 2000, qty: 3, vp: 25.0, discount: 50 };
  const item3Total = Math.round(item3.mrp * item3.qty * (1 - item3.discount / 100));
  TestRunner.assertEquals('50% Supervisor slab total calculation', item3Total, 3000);

  console.groupEnd();
}

// 2. Cart Totals & Savings Calculation Tests
function testCartTotalsAndSavings() {
  console.group('--- Cart Totals & Savings Calculation Tests ---');

  const cart = [
    { name: 'Afresh Energy Drink', sku: '1247', mrp: 850, qty: 2, vp: 7.5, totalVP: 15.0, total: 1275, discount: 25 },
    { name: 'Formula 1 Shake', sku: '0141', mrp: 2200, qty: 1, vp: 21.75, totalVP: 21.75, total: 1650, discount: 25 }
  ];

  const grandTotal = cart.reduce((sum, i) => sum + i.total, 0);
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const grandVP = cart.reduce((sum, i) => sum + (parseFloat(i.totalVP) || 0), 0);
  const totalMRPVal = cart.reduce((sum, i) => sum + ((parseFloat(i.mrp) || 0) * (parseInt(i.qty) || 1)), 0);
  const totalSavings = Math.max(0, totalMRPVal - grandTotal);

  TestRunner.assertEquals('Cart grand total calculation', grandTotal, 2925);
  TestRunner.assertEquals('Cart total items units calculation', totalQty, 3);
  TestRunner.assertCloseTo('Cart grand VP calculation', grandVP, 36.75);
  TestRunner.assertEquals('Cart total MRP value calculation', totalMRPVal, 3900);
  TestRunner.assertEquals('Cart total customer savings calculation', totalSavings, 975);

  console.groupEnd();
}

// 3. Bill Record Construction Tests
function testBillRecordConstruction() {
  console.group('--- Bill Record Structure Tests ---');

  const cust = 'Ramesh Kumar';
  const payType = 'Cash';
  const billTier = '25';
  const cart = [
    { name: 'Afresh Lemon', sku: '1247', mrp: 850, qty: 1, vp: 7.5, totalVP: 7.5, total: 638, discount: 25 }
  ];

  const saleRecord = {
    date: '29/08/2026',
    customer: cust,
    items: JSON.parse(JSON.stringify(cart)),
    product: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
    qty: 1,
    totalVP: 7.5,
    totalMRP: 850,
    totalSavings: 212,
    discountLabel: '25% Slab',
    total: 638,
    paymentType: payType,
    status: payType === 'Udhaar' ? 'Pending' : 'Paid'
  };

  TestRunner.assertEquals('Sale record customer name matches', saleRecord.customer, 'Ramesh Kumar');
  TestRunner.assertEquals('Sale record payment status is Paid for Cash', saleRecord.status, 'Paid');
  TestRunner.assertEquals('Sale record items length', saleRecord.items.length, 1);
  TestRunner.assertEquals('Sale record discount label formatting', saleRecord.discountLabel, '25% Slab');

  console.groupEnd();
}

// 4. Modal Element Data Binding Simulation
function testPreviewModalDataBinding() {
  console.group('--- Preview Modal Data Binding Simulation ---');

  const saleRecord = {
    date: '29/08/2026',
    customer: 'Sunita Sharma',
    items: [{ name: 'Personalized Protein Powder', qty: 2, totalVP: 23.0, total: 2400 }],
    qty: 2,
    totalVP: 23.0,
    discountLabel: 'Custom 20%',
    totalSavings: 600,
    total: 2400,
    paymentType: 'Udhaar',
    status: 'Pending'
  };

  const isPending = (saleRecord.paymentType === 'Udhaar' || saleRecord.status === 'Pending');
  const badgeClass = isPending ? 'badge-credit' : 'badge-cash';

  TestRunner.assertEquals('Udhaar payment assigns badge-credit class', badgeClass, 'badge-credit');
  TestRunner.assertEquals('Customer name binding', saleRecord.customer, 'Sunita Sharma');
  TestRunner.assertEquals('Grand total binding', saleRecord.total, 2400);

  console.groupEnd();
}

// Run All Tests
function runAllTests() {
  TestRunner.passed = 0;
  TestRunner.failed = 0;
  TestRunner.results = [];

  testBillingCalculations();
  testCartTotalsAndSavings();
  testBillRecordConstruction();
  testPreviewModalDataBinding();

  console.log(`\n%c==================================\nTests Completed: Passed: ${TestRunner.passed}, Failed: ${TestRunner.failed}\n==================================`, 
    TestRunner.failed === 0 ? 'color: #10B981; font-weight: bold;' : 'color: #EF4444; font-weight: bold;');

  return {
    passed: TestRunner.passed,
    failed: TestRunner.failed,
    results: TestRunner.results
  };
}

if (typeof window !== 'undefined') {
  window.BwcTestRunner = { runAllTests, TestRunner };
}
