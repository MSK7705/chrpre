import fs from 'fs';

const csvData = fs.readFileSync('assets/food_data.csv', 'utf-8');
const lines = csvData.split('\n');

const foodItems = [];
const headers = lines[0].split(',');
const nameIdx = headers.indexOf('food_name');
const calIdx = headers.indexOf('energy_kcal');
const protIdx = headers.indexOf('protein_g');
const sodIdx = headers.indexOf('sodium_mg');
const cholIdx = headers.indexOf('cholesterol_mg');

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  // Clean split for standard CSV, respecting quotes
  let row = lines[i];
  let inQuote = false;
  let currentToken = '';
  let cols = [];

  for (let char of row) {
    if (char === '"') inQuote = !inQuote;
    else if (char === ',' && !inQuote) {
      cols.push(currentToken);
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  cols.push(currentToken);

  if (cols.length >= headers.length) {
    let name = (cols[nameIdx] || '').replace(/^"|"$/g, '').trim();
    if (!name) continue;

    foodItems.push({
      name: name,
      calories: parseFloat(cols[calIdx]) || 0,
      protein: parseFloat(cols[protIdx]) || 0,
      sodium: parseFloat(cols[sodIdx]) || 0,
      cholesterol: parseFloat(cols[cholIdx]) || 0
    });
  }
}

const tsContent = `export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  sodium: number;
  cholesterol: number;
}

export const foodItems: FoodItem[] = ${JSON.stringify(foodItems, null, 2)};
`;

fs.writeFileSync('src/data/food_data.ts', tsContent);
console.log(`Successfully parsed ${foodItems.length} food items and added cholesterol mapping!`);
