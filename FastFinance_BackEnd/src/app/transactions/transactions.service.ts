import { Inject, Injectable } from '@nestjs/common';
import CreateTransaction from '@use-cases/transactions/create-transaction';
import { UpdateTransaction } from '@use-cases/transactions/update-transaction';
import { GetTransactionById } from '@use-cases/transactions/get-transaction-by-id';
import { SoftDeleteTransaction } from '@use-cases/transactions/softdelete-transaction';
import GetTransactions from '@use-cases/transactions/get-transactions';
import { UpdateTransactionDto } from '@app/transactions/dto/update-transactions.dto';
import { FilterObject, OrderObject } from '@domain/basic/irepository';
import { TransactionInput } from '@domain/transactions/inputs/transaction-input';

@Injectable()
export class TransactionsService {
  constructor(
    private createTransaction: CreateTransaction,
    private getTransactions: GetTransactions,
    private getTransactionById: GetTransactionById,
    private softDeleteTransaction: SoftDeleteTransaction,
    private updateTransaction: UpdateTransaction,
  ) {}

  async Create(input: TransactionInput) {
    return await this.createTransaction.Execute(input);
  }

  async Update(input: UpdateTransactionDto, id: string) {
    return await this.updateTransaction.Execute(input, id);
  }

  async FindAll(
    page: number,
    recordsPerPage: number,
    filter?: FilterObject[],
    order?: OrderObject,
    noLimit?: boolean,
  ) {
    return await this.getTransactions.Execute(
      page,
      recordsPerPage,
      filter,
      order,
      noLimit,
    );
  }

  async FindOne(id: string) {
    return await this.getTransactionById.Execute(id);
  }

  async Remove(id: string) {
    return await this.softDeleteTransaction.Execute(id);
  }
}
