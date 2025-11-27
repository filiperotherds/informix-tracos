import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as odbc from 'odbc';
import { env } from '../env';

const informix = env.INFORMIX_STRING

if (!informix || informix.trim() === '') {
  throw new Error('INFORMIX_STRING environment variable is not set');
}

@Injectable()
export class InformixService implements OnModuleInit, OnModuleDestroy {
  private pool!: odbc.Pool;
  private readonly logger = new Logger(InformixService.name);

  async onModuleInit() {
    try {
      this.pool = await odbc.pool({
        connectionString: informix,
        initialSize: 2,
        maxSize: 10,
        connectionTimeout: 10,
      });
      this.logger.log('Informix Pool initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Informix Pool', error);
      throw error;
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database pool is not initialized');
    }

    try {
      const result = await this.pool.query(sql, params);
      return result as T[];
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
    }
  }
}
