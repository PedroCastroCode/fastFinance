import { ChatBotService } from '@app/chat_bot_service/chat_bot.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import CreateTransaction from '@use-cases/transactions/create-transaction';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: any;

  constructor(
    private readonly chatBotService: ChatBotService,
    private readonly createTransaction: CreateTransaction,
    private readonly rabbitmqService: RabbitmqService, 
  ) { }

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.error('TELEGRAM_BOT_TOKEN não definido');
      return;
    }

    const TelegramBot = require('node-telegram-bot-api');
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.on('polling_error', (err: any) => {
      this.logger.error(`polling_error: ${JSON.stringify(err)}`);
    });

    this.bot.on('message', async (msg: any) => {
      this.logger.log(
        `Mensagem recebida: ${JSON.stringify({
          chatId: msg.chat?.id,
          from: msg.from?.id,
          text: msg.text,
        })}`,
      );

      const text = (msg.text || '').toLowerCase().trim();

      if (text) {
        await this.rabbitmqService.publishTelegramMessage({
          chatId: msg.chat.id,
          text,
          timestamp: new Date().toISOString(),
        });

        this.bot.sendMessage(
          msg.chat.id,
          '✅ Mensagem recebida! Processando...',
        );
      } else {
        this.logger.error(`text vazio = ${text}`);
      }
    });

    this.logger.log('Telegram bot iniciado com polling: true.');
  }
}