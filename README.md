# 🤖 AISvoi - Your Personal AI Assistant

**AISvoi** (AI Свой) - это полнофункциональная платформа для запуска AI-ассистента на вашем собственном компьютере. Полностью бесплатно, приватно и без ограничений!

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Возможности

- 🔒 **100% Приватность** - Все данные хранятся локально на вашем компьютере
- 💰 **Абсолютно бесплатно** - Никаких подписок, API ключей или лимитов
- 🧠 **Множество моделей** - Поддержка Llama 2, Mistral, Code Llama и многих других
- 💬 **Удобный интерфейс** - Современный веб-интерфейс с темной темой
- 📚 **История диалогов** - Все ваши беседы сохраняются локально
- ⚡ **Быстрая работа** - Оптимизировано для работы на локальном железе
- 🐳 **Простая установка** - Запуск одной командой через Docker
- 🎨 **Красивый UI** - Responsive дизайн, работает на любых устройствах
- 📝 **Markdown поддержка** - Форматирование текста, код с подсветкой синтаксиса
- 🔄 **Streaming ответы** - Ответы появляются в реальном времени

## 🚀 Быстрый старт

### Требования

- **Docker** и **Docker Compose** установлены на вашем компьютере
- **8GB RAM** минимум (рекомендуется 16GB)
- **10GB** свободного места на диске (для моделей)
- **GPU** (опционально, для ускорения) - NVIDIA с поддержкой CUDA

### Установка за 3 шага

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/yourusername/AISvoi.git
cd AISvoi
```

2. **Запустите проект:**
```bash
# С GPU (NVIDIA)
docker-compose up -d

# Без GPU (только CPU)
docker-compose -f docker-compose.cpu.yml up -d
```

3. **Откройте в браузере:**
```
http://localhost:3000
```

Готово! 🎉

## 📖 Подробная инструкция

### Первый запуск

1. После запуска откройте http://localhost:3000
2. Нажмите на селектор моделей (вверху справа)
3. Нажмите "+ Pull New Model"
4. Выберите модель из списка популярных или введите название
5. Дождитесь скачивания модели (может занять 5-15 минут)
6. Начните общаться с AI!

### Рекомендуемые модели для начала

**Для слабых систем (4-8GB RAM):**
- `phi` (2.7GB) - Отличная маленькая модель от Microsoft
- `gemma:2b` (1.4GB) - Компактная модель от Google

**Для средних систем (8-16GB RAM):**
- `llama2` (3.8GB) - Популярная модель от Meta
- `mistral` (4.1GB) - Быстрая и качественная модель
- `neural-chat` (4.1GB) - Хороша для диалогов

**Для мощных систем (16GB+ RAM):**
- `llama2:13b` (7.3GB) - Более умная версия Llama 2
- `codellama` (3.8GB) - Специализирована на программировании

## 🛠️ Управление

### Управление Docker контейнерами

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Полная очистка (удалит все данные!)
docker-compose down -v
```

### Работа с моделями

**Скачивание новой модели:**
- Откройте веб-интерфейс
- Кликните на селектор моделей
- Нажмите "+ Pull New Model"
- Выберите модель

**Удаление модели:**
```bash
docker exec -it aisvoi_ollama ollama rm <model-name>
```

**Просмотр установленных моделей:**
```bash
docker exec -it aisvoi_ollama ollama list
```

## 📁 Структура проекта

```
AISvoi/
├── backend/                # Python FastAPI backend
│   ├── main.py            # Основное приложение API
│   ├── database.py        # Модели базы данных
│   ├── ollama_client.py   # Клиент для Ollama
│   ├── requirements.txt   # Python зависимости
│   └── Dockerfile
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── App.js       # Главный компонент
│   │   └── api.js       # API клиент
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Docker конфигурация
└── README.md             # Эта документация
```

## 🔧 Конфигурация

### Переменные окружения (backend/.env)

```env
OLLAMA_HOST=http://ollama:11434
DATABASE_URL=sqlite:///./data/aisvoi.db
CORS_ORIGINS=http://localhost:3000
```

### Порты

- **Frontend**: 3000
- **Backend API**: 8000
- **Ollama**: 11434

### Для систем без GPU

Если у вас нет NVIDIA GPU, создайте файл `docker-compose.cpu.yml`:

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: aisvoi_ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aisvoi_backend
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - DATABASE_URL=sqlite:///./data/aisvoi.db
    volumes:
      - ./backend:/app
      - backend_data:/app/data
    depends_on:
      - ollama
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aisvoi_frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  ollama_data:
  backend_data:
```

## 🎯 Использование API

### Endpoints

#### Chat
```bash
POST http://localhost:8000/chat/stream
Content-Type: application/json

{
  "message": "Hello!",
  "conversation_id": 1,
  "model": "llama2"
}
```

#### Conversations
```bash
# Список диалогов
GET http://localhost:8000/conversations

# Создать диалог
POST http://localhost:8000/conversations
Content-Type: application/json
{"title": "My Chat"}

# Удалить диалог
DELETE http://localhost:8000/conversations/{id}
```

#### Models
```bash
# Список моделей
GET http://localhost:8000/models

# Скачать модель
POST http://localhost:8000/models/pull
Content-Type: application/json
{"name": "llama2"}
```

## 🐛 Решение проблем

### Ollama не запускается
```bash
# Проверьте логи
docker logs aisvoi_ollama

# Перезапустите контейнер
docker restart aisvoi_ollama
```

### Frontend не подключается к Backend
- Проверьте, что backend запущен: http://localhost:8000/health
- Убедитесь, что все контейнеры работают: `docker-compose ps`

### Модель долго скачивается
- Это нормально! Модели весят от 1 до 7+ GB
- Скорость зависит от вашего интернета
- Можно проверить прогресс в логах: `docker logs -f aisvoi_backend`

### Нехватка памяти
- Попробуйте модели поменьше (phi, gemma:2b)
- Закройте другие приложения
- Увеличьте swap память в системе

## 📊 Производительность

### Требования по памяти (примерно):

| Модель | RAM | GPU VRAM |
|--------|-----|----------|
| gemma:2b | 4GB | 2GB |
| phi | 6GB | 3GB |
| llama2 | 8GB | 5GB |
| mistral | 8GB | 5GB |
| llama2:13b | 16GB | 10GB |

### Скорость генерации (токенов/сек):

- **CPU only**: 2-10 tokens/sec
- **GPU (GTX 1060)**: 15-30 tokens/sec
- **GPU (RTX 3060)**: 30-60 tokens/sec
- **GPU (RTX 4090)**: 80-150 tokens/sec

## 🔐 Безопасность

- ✅ Все данные хранятся локально
- ✅ Нет отправки данных на внешние серверы
- ✅ Нет телеметрии
- ✅ Полный контроль над вашей информацией
- ✅ Можно использовать без интернета (после скачивания моделей)

## 🤝 Вклад в проект

Приветствуются любые улучшения!

1. Fork проекта
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

MIT License - используйте свободно!

## 🙏 Благодарности

- [Ollama](https://ollama.ai/) - за отличный инструмент для запуска LLM
- [FastAPI](https://fastapi.tiangolo.com/) - за быстрый backend framework
- [React](https://react.dev/) - за мощный UI framework

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:
- Создайте Issue в GitHub
- Проверьте раздел "Решение проблем" выше
- Посмотрите логи: `docker-compose logs`

---

**Создано с ❤️ для свободного AI**

*Наслаждайтесь вашим личным AI-ассистентом!* 🚀
