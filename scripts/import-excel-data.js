// Script pro import dat z Excel souboru do Convex databáze
// Spustit pomocí: node scripts/import-excel-data.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Načíst Excel soubor
const excelPath = '/tmp/zakazky.xlsm';

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel soubor nenalezen na cestě:', excelPath);
  console.log('💡 Přesuň soubor zakazky.xlsm do tmp/ složky');
  process.exit(1);
}

console.log('📂 Načítám Excel soubor...');
const workbook = XLSX.readFile(excelPath);

// Načíst data z listů
const ordersSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Objednávky'], { header: 1, defval: '' });
const vehiclesSheet = XLSX.utils.sheet_to_json(workbook.Sheets['SPZ'], { header: 1, defval: '' });

console.log(`✓ Načteno ${ordersSheet.length - 2} zakázek`);
console.log(`✓ Načteno ${vehiclesSheet.length - 1} vozidel`);

// Zpracovat vozidla (SPZ list)
const vehicles = [];
const vehicleHeaders = vehiclesSheet[0];

for (let i = 1; i < vehiclesSheet.length; i++) {
  const row = vehiclesSheet[i];
  
  if (!row[0]) continue; // Přeskočit prázdné řádky
  
  vehicles.push({
    licencePlate: row[0] || '',
    make: row[1] || '',
    modelLine: row[2] || '',
    trim: row[5] || '',
    powertrain: row[6] || '',
    vinCode: row[10] || '',
    lessor: row[11] || '',
    ownershipType: row[12] || '',
    permanentAddressCity: row[13] || '',
  });
}

// Zpracovat zakázky
const orders = [];
const orderHeaders = ordersSheet[1]; // Hlavičky jsou na řádku 2

for (let i = 2; i < ordersSheet.length; i++) {
  const row = ordersSheet[i];
  
  if (!row[1]) continue; // Přeskočit řádky bez čísla zakázky
  
  orders.push({
    date: row[0] || '',
    orderNumber: parseInt(row[1]) || 0,
    licencePlate: row[2] || '',
    company: row[3] || '',
    kmState: row[4] || '',
    contactName: row[5] || '',
    contactCompany: row[6] || '',
    phone: row[7] || '',
    repairRequest: row[8] || '',
    deadline: row[9] || '',
    time: row[10] || '',
    note: row[11] || '',
    pickUp: row[12] || '',
    pickUpAddress: row[13] || '',
    pickUpTimeCollection: row[14] || '',
    pickUpTimeReturn: row[15] || '',
    nv: row[16] || '',
    email: row[17] || '',
    autoService: row[18] || '',
    vin: row[19] || '',
    brand: row[20] || '',
    confirmed: row[21] || '',
    calculation: row[22] || '',
    invoicing: row[23] || '',
    overdue: row[24] || '',
  });
}

// Uložit do JSON souborů pro import do Convex
const vehiclesJson = path.join(__dirname, '../tmp/vehicles-import.json');
const ordersJson = path.join(__dirname, '../tmp/orders-import.json');

fs.writeFileSync(vehiclesJson, JSON.stringify(vehicles, null, 2));
fs.writeFileSync(ordersJson, JSON.stringify(orders, null, 2));

console.log('\n✅ Data připravena pro import:');
console.log(`   📄 Vozidla: ${vehiclesJson} (${vehicles.length} záznamů)`);
console.log(`   📄 Zakázky: ${ordersJson} (${orders.length} záznamů)`);
console.log('\n📝 Další kroky:');
console.log('   1. Otevři Convex dashboard: npx convex dashboard');
console.log('   2. Použij "Import data" funkci');
console.log('   3. Nahraj JSON soubory');
