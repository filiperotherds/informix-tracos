import { Global, Module } from '@nestjs/common';
import { TractianApiService } from './tractian-api.service';

@Global()
@Module({
    providers: [TractianApiService],
    exports: [TractianApiService],
})
export class TractianApiModule { }
