import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Products
  await db.execute(sql`INSERT IGNORE INTO products (name, slug, description, contents, category, standardPrice, groupPrice, discount, groupSize, imageUrl, isActive)
    VALUES
    ('Pack Chaleur — Énergie Solaire', 'pack-chaleur-solaire',
     'Le pack essentiel pour affronter la chaleur avec des solutions solaires durables.',
     '["Powerbank solaire hybride","Mini-ventilateur USB","Lampe LED rechargeable"]',
     'solaire', 25000, 17500, 30, 50, NULL, 1),
    ('Pack Confort Solaire — Énergie Solaire', 'pack-confort-solaire',
     'Le pack premium pour un confort optimal avec l''énergie solaire.',
     '["Ventilateur solaire rechargeable","Powerbank solaire hybride","Chargeur universel"]',
     'solaire', 35000, 24500, 30, 50, NULL, 1)`);

  // Groups for each product
  await db.execute(sql`INSERT IGNORE INTO \`groups\` (productId, currentMembers, maxMembers, status)
    SELECT id, FLOOR(RAND() * 30) + 5, 50, 'open' FROM products`);

  // Demo cagnottes
  await db.execute(sql`INSERT IGNORE INTO cagnottes (title, description, category, carrierType, targetAmount, currentAmount, contributorsCount, mobileMoneyNumber, status, creatorName, creatorPhone)
    VALUES
    ('Mariage de Fatou & Ibrahim', 'Aidez-nous à célébrer notre union ! Chaque contribution compte pour rendre ce jour inoubliable.', 'mariage', 'groupe', 500000, 175000, 12, '70123456', 'active', 'Fatou', '70123456'),
    ('Frais de scolarité pour Aminata', 'Soutenons Aminata dans ses études universitaires à Ouagadougou.', 'education', 'individuel', 250000, 89000, 8, '76543210', 'active', 'Moussa', '76543210'),
    ('Construction du puits communautaire', 'Notre village a besoin d''un puits pour accéder à l''eau potable.', 'construction', 'collectif', 1500000, 420000, 35, '71234567', 'active', 'Association Zood-Nooma', '71234567')`);

  // Demo contributions
  await db.execute(sql`INSERT IGNORE INTO contributions (cagnotteId, contributorName, contributorPhone, amount, message, paymentStatus, isAnonymous)
    VALUES
    (1, 'Adama', '70111111', 10000, 'Félicitations !', 'completed', 0),
    (1, NULL, '70222222', 5000, NULL, 'completed', 1),
    (2, 'Ousmane', '70333333', 15000, 'Bon courage Aminata !', 'completed', 0),
    (3, 'Issa', '70444444', 25000, 'Pour notre village', 'completed', 0)`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
