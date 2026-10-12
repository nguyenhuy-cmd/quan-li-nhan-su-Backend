import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { PositionsModule } from './positions/positions.module.js';
import { SalariesModule } from './salaries/salaries.module.js';
import { AttendancesModule } from './attendances/attendances.module.js';
import { LeavesModule } from './leaves/leaves.module.js';
import { PerformancesModule } from './performances/performances.module.js';


export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    SalariesModule,
    AttendancesModule,
    LeavesModule,
    PerformancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
