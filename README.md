# OTP Microservice

Микросервис для генерации и верификации OTP кодов.

## Технологии

- NestJS
- Redis (хранение OTP)
- Swagger (документация)

## Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Запуск Redis
docker-compose up -d

# Запуск в режиме разработки
pnpm run start:dev
```

## API Endpoints

| Метод  | Путь                   | Описание             |
| ------ | ---------------------- | -------------------- |
| `POST` | `/api/auth/otp`        | Создание OTP кода    |
| `POST` | `/api/auth/otp/verify` | Верификация OTP кода |
| `GET`  | `/api/health`          | Health check         |

### Создание OTP

```bash
curl -X POST http://localhost:3000/api/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "89990009999"}'
```

**Ответ:**

```json
{
  "success": true,
  "retryDelay": 120000,
  "code": 650231 // только в dev режиме
}
```

### Верификация

```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "89990009999", "code": 650231}'
```

**Ответ:**

```json
{
  "success": true
}
```

## Конфигурация

Переменные окружения в `.env`:

| Переменная       | Описание        | По умолчанию |
| ---------------- | --------------- | ------------ |
| `REDIS_HOST`     | Хост Redis      | localhost    |
| `REDIS_PORT`     | Порт Redis      | 6379         |
| `REDIS_PASSWORD` | Пароль Redis    | -            |
| `PORT`           | Порт приложения | 3000         |
| `GLOBAL_PREFIX`  | Префикс URL     | api          |

## Документация

Swagger доступен по адресу: `http://localhost:3000/api/docs`

## Интеграция с другими микросервисами

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async sendOtp(phone: string) {
    return this.httpService.axiosRef.post('/api/auth/otp', { phone });
  }

  async verifyOtp(phone: string, code: number) {
    return this.httpService.axiosRef.post('/api/auth/otp/verify', {
      phone,
      code,
    });
  }
}
```

## Тесты

```bash
# Юнит тесты (запускаются при commit)
pnpm run test

# С покрытием
pnpm run test:cov

# E2E тесты
pnpm run test:e2e
```

## Лицензия

ISC
