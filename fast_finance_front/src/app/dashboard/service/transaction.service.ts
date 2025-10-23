import { BaseService } from "@/app/utils/route.service";
import { environment } from "@/routes/enviroments.router";
import axios, { AxiosResponse } from "axios";

class TransactionsService extends BaseService {
  protected get resourceName(): string {
    return "transactions";
  }

  // Método para buscar todas as transações
  public getAllTransactions<TResponse>(): Promise<AxiosResponse<TResponse>> {
    return super.get<TResponse>("");
  }

  // Método para buscar transação por ID
  public getTransactionById<TResponse>(id: string): Promise<AxiosResponse<TResponse>> {
    return super.get<TResponse>(id);
  }

  // Método para criar nova transação
  public createTransaction<TRequest, TResponse>(
    body: TRequest
  ): Promise<AxiosResponse<TResponse>> {
    return super.post<TRequest, TResponse>(body);
  }
}

const transactionService = new TransactionsService();
export default transactionService;
