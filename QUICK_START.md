# ⚡ Быстрый старт AISvoi

## 🚀 Запуск за 3 минуты

### 1. Запустите систему
```bash
./start.sh
```

### 2. Откройте браузер
```
http://localhost:3000
```

### 3. Скачайте модель (выберите одну)

#### Для большинства пользователей:
```bash
docker exec -it aisvoi_ollama ollama pull mistral
```

#### Для слабых ПК:
```bash
docker exec -it aisvoi_ollama ollama pull phi
```

#### Для программистов:
```bash
docker exec -it aisvoi_ollama ollama pull codellama
```

## 🎯 Готово!

Теперь обновите страницу в браузере и начинайте общаться!

---

## 💡 Полезные команды

### Посмотреть установленные модели:
```bash
docker exec -it aisvoi_ollama ollama list
```

### Удалить модель:
```bash
docker exec -it aisvoi_ollama ollama rm <model-name>
```

### Остановить систему:
```bash
./stop.sh
```

### Посмотреть логи:
```bash
docker-compose logs -f
```

### Перезапустить:
```bash
docker-compose restart
```

---

## 🧠 Рекомендации моделей

| Если у вас... | Скачайте |
|---------------|----------|
| 4-8GB RAM | `phi` или `gemma:2b` |
| 8-16GB RAM | `mistral` (лучший выбор!) |
| 16GB+ RAM | `llama2:13b` или `mixtral` |
| Нужен код | `codellama` |
| Нужен русский | `saiga` или `mistral` |

**Подробнее:** [MODELS_GUIDE.md](MODELS_GUIDE.md)

---

## ❓ Решение проблем

### Модель не скачивается?
- Проверьте интернет
- Убедитесь что Ollama запущена: `docker ps | grep ollama`
- Посмотрите логи: `docker logs aisvoi_ollama`

### Не открывается интерфейс?
- Проверьте что все контейнеры работают: `docker-compose ps`
- Попробуйте: http://localhost:3000

### Медленно работает?
- Попробуйте модель поменьше (phi, gemma:2b)
- Закройте другие приложения
- Используйте GPU если есть

---

**Приятного использования! 🎉**
