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

  private pingInterval: NodeJS.Timeout | null = null
  private readonly PING_INTERVAL_MS = 300000

  private startHeartbeat() {
    this.pingInterval = setInterval(async () => {
      try {
        await this.pool.query('SELECT 1 FROM sysmaster:sysdual')

        console.log(`Keep-Alive query executed.`)
      } catch (err) {
        this.logger.warn('Heartbeat ping failed - connections might be refreshing', err);
      }
    }, this.PING_INTERVAL_MS)
  }

  async onModuleInit() {
    try {
      this.pool = await odbc.pool({
        connectionString: informix,
        connectionTimeout: 10,
        loginTimeout: 5,
        initialSize: 2,
        maxSize: 5,
      });

      this.logger.log('Informix Pool initialized successfully');
      this.startHeartbeat()
    } catch (error) {
      this.logger.error('Failed to initialize Informix Pool', error);
      throw error;
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.pool.query(sql, params) as Promise<T[]>;
  }

  async transaction<T>(
    callback: (connection: odbc.Connection) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.connect();
    try {
      await connection.query('BEGIN WORK');
      const result = await callback(connection);
      await connection.query('COMMIT WORK');
      return result;
    } catch (error) {
      try {
        await connection.query('ROLLBACK WORK');
      } catch (rollbackError) {
        this.logger.error('Rollback failed', rollbackError);
      }
      throw error;
    } finally {
      await connection.close();
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
    }
  }
}
