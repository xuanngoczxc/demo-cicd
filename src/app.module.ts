import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/module/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/user.entity';
import { Photo } from './users/entity/photo.entity';
import { PhotoModule } from './users/module/photo.module';
import { AuthModule } from './auth/auth.module';
import { RequestLoggerMiddleware } from './utils/request-logger.middleware';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants/jwt.constant';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db-cicd.cn2ewewyojv2.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: '04052003',
      database: 'Relation',
      entities: [User, Photo],
      synchronize: true,
    }),UsersModule, PhotoModule, AuthModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m'}
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
      // {
      //   provide: APP_GUARD,
      //   useClass: AuthGuard,
      // },
      // {
      //   provide: APP_GUARD,
      //   useClass: RolesGuard,
      // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
