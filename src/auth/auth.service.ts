import { HttpException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth-guard-token';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly authGuard: AuthGuard,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('Credenciales invalidas', 404);
    }
    const isPasswordValid = await this.userService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Credenciales invalidas', 404);
    }
    const userWithoutPassword = plainToClass(User, user);

    // Genera el token
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user: userWithoutPassword, token };
  }
}
