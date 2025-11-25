import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ChatBotService } from '@app/chat_bot_service/chat_bot.service';
import CreateTransaction from '@use-cases/transactions/create-transaction';

@Injectable()
export class RabbitWorkerService implements OnModuleInit {
    private readonly logger = new Logger(RabbitWorkerService.name);
    private readonly queueName = 'telegram_messages';
    private bot: any;

    constructor(
        private readonly chatBotService: ChatBotService,
        private readonly createTransaction: CreateTransaction,
    ) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (token) {
            const TelegramBot = require('node-telegram-bot-api');
            this.bot = new TelegramBot(token, { polling: false });
        } else {
            this.logger.warn('TELEGRAM_BOT_TOKEN não definido no RabbitWorkerService');
        }
    }

    async onModuleInit() {
        try {
            const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
            const connection = await amqp.connect(url);
            const channel = await connection.createChannel();
            await channel.assertQueue(this.queueName, { durable: true });
            channel.prefetch(1);

            this.logger.log(`Worker ouvindo fila ${this.queueName} em ${url}`);

            channel.consume(this.queueName, async (msg) => {
                if (!msg) return;

                const content = msg.content.toString();
                this.logger.log(`Mensagem recebida da fila: ${content}`);

                try {
                    const data = JSON.parse(content);
                    const { chatId, text, timestamp } = data;

                    const res = await this.chatBotService.axiosChatBot(text);

                    if (!res.success) {
                        this.bot?.sendMessage(
                            chatId,
                            'Não foi possível registrar a transação. Verifique os dados e tente novamente.',
                        );
                        channel.ack(msg);
                        return;
                    }

                    await this.createTransaction.Execute(res.data);

                    const messageToUser = `Registrado ${res.data.type} no dia ${res.data.date} na categoria ${res.data.category} no valor de ${res.data.value}`;
                    this.bot?.sendMessage(chatId, messageToUser);

                    channel.ack(msg);
                } catch (error) {
                    this.logger.error(`Erro ao processar mensagem: ${error.message}`);
                    channel.nack(msg, false, false);
                }
            });
        } catch (error) {
            this.logger.error(`Erro ao iniciar worker RabbitMQ: ${error.message}`);
        }
    }
}