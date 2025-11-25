import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitmqService.name);
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly queueName = 'telegram_messages';

    async onModuleInit() {
        try {
            const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            this.logger.log(`Conectado ao RabbitMQ em ${url}, fila: ${this.queueName}`);
        } catch (err) {
            this.logger.error(`Erro ao conectar no RabbitMQ: ${err.message}`);
        }
    }

    async onModuleDestroy() {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (err) {
            this.logger.error(`Erro ao fechar conexão RabbitMQ: ${err.message}`);
        }
    }

    async publishTelegramMessage(payload: any) {
        if (!this.channel) {
            this.logger.error('Canal RabbitMQ não inicializado');
            return;
        }

        const buffer = Buffer.from(JSON.stringify(payload));
        this.channel.sendToQueue(this.queueName, buffer, { persistent: true });
        this.logger.log(`Mensagem publicada na fila ${this.queueName}: ${JSON.stringify(payload)}`);
    }
}