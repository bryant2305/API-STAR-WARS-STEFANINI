import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import bcrypt from 'bcryptjs';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    const hashedAdminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD, // Hashea la contraseña con bcrypt
      10,
    );

    const users = userRepository.create([
      {
        email: process.env.ADMIN_EMAIL,
        password: hashedAdminPassword,
      },
    ]);
    await userRepository.save(users);
  }
}
