import { IUsersRepository } from '@domain/users/repositories/iusers.repository';
import { Inject } from '@nestjs/common';

export default class GetUserByEmail {
  constructor(
    @Inject('IUsersRepository')
    private userRepo: IUsersRepository,
  ) {}

  async Execute(email: string) {
    return await this.userRepo.GetUserByEmail(email);
  }
}
