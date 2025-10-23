import { ChatBotService } from '@app/chat_bot_service/chat_bot.service';
import { Provider } from '@nestjs/common';
import CreateTransaction from '@use-cases/transactions/create-transaction';
import { GetTransactionById } from '@use-cases/transactions/get-transaction-by-id';
import GetTransactions from '@use-cases/transactions/get-transactions';
import { SoftDeleteTransaction } from '@use-cases/transactions/softdelete-transaction';
import { UpdateTransaction } from '@use-cases/transactions/update-transaction';
import CreateUser from '@use-cases/users/create-user';
import { GetUserById } from '@use-cases/users/get-user-by-id';
import GetUserByUserName from '@use-cases/users/get-user-by-username';
import GetUsers from '@use-cases/users/get-users';
import { SoftDeleteUser } from '@use-cases/users/softdelete-user';
import { UpdateUser } from '@use-cases/users/update-user';

export const useCasesProvider: Provider[] = [
  CreateUser,
  UpdateUser,
  GetUsers,
  GetUserById,
  SoftDeleteUser,
  GetUserByUserName,
  CreateTransaction,
  GetTransactions,
  GetTransactionById,
  SoftDeleteTransaction,
  UpdateTransaction,
  {
    provide: 'IChatBotService',
    useClass: ChatBotService,
  },
];
