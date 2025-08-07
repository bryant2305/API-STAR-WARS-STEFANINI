import { User } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class RoleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    const users = userRepository.create([
      {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
      },
    ]);
    await userRepository.save(users);
  }
}