import { config } from 'dotenv';
import { DynamoService } from '../modules/dynamo/dynamo.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

config();

async function seed() {
  const dynamoService = new DynamoService();
  const tableName = process.env.USERS_TABLE;

  const defaultEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
  const defaultPassword = process.env.ADMIN_PASSWORD || '123456';

  const users = await dynamoService.scanTable(tableName);
  const exists = users.find((u: any) => u.email === defaultEmail);

  if (exists) {
    console.log(`ℹ Usuario ${defaultEmail} ya existe.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  await dynamoService.putItem(tableName, {
    id: uuidv4(),
    email: defaultEmail,
    password: hashedPassword,
    name: 'Default Admin',
  });

  console.log(
    `✅ Usuario por defecto creado: ${defaultEmail} / ${defaultPassword}`,
  );
}

seed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
});
