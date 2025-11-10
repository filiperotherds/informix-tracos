import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as odbc from 'odbc';

const informix = process.env.INFORMIX_LOCAL || '';

if (!informix || informix.trim() === '') {
  throw new Error('INFORMIX_STRING environment variable is not set');
}

@Injectable()
export class InformixService implements OnModuleInit, OnModuleDestroy {
  private connection: any;

  async onModuleInit() {
    this.connection = await odbc.connect(informix);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.connection.query(sql, params);
    return result as T[];
  }

  async onModuleDestroy() {
    await this.connection.close();
  }
}
