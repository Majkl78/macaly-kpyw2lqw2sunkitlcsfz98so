// Import dat do Convex databáze
// Spustit pomocí: node scripts/upload-to-convex.js

const fs = require('fs');

const vehiclesData = JSON.parse(fs.readFileSync('/home/user/tmp/vehicles-import.json', 'utf8'));
const ordersData = JSON.parse(fs.readFileSync('/home/user/tmp/orders-import.json', 'utf8'));

console.log('📊 Načteno:');
console.log(`   Vozidla: ${vehiclesData.length} záznamů`);
console.log(`   Zakázky: ${ordersData.length} záznamů`);

console.log('\n🚀 Pro import dat spusť v Convex dashboard:');
console.log('   npx convex dashboard');
console.log('\n📝 Pak spusť v konzoli:');
console.log('\nPro import vozidel (po dávkách):');

// Rozdělit na menší dávky (100 najednou)
const vehicleBatches = [];
for (let i = 0; i < vehiclesData.length; i += 100) {
  vehicleBatches.push(vehiclesData.slice(i, i + 100));
}

console.log(`\n// Import ${vehicleBatches.length} dávek vozidel:`);
vehicleBatches.forEach((batch, i) => {
  console.log(`await mutation.importData.importVehicles({ vehicles: ${JSON.stringify(batch)} })`);
});

console.log('\n\nNebo použij tento jednodušší způsob:');
console.log('Otevři http://localhost:3000/admin/import a nahraj JSON soubory tam.');
