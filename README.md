# ClimbKit

Учёт личного альпинистского и скалолазного снаряжения.
Прототип: https://stoika-gear-ilya-star.vercel.app

## Посмотреть в браузере

    npm run serve      # откроет http://localhost:8080

Или просто открыть `www/index.html` двойным щелчком.

## Собрать APK локально

Нужны Node 20+, JDK 21 и Android SDK (ставится вместе с Android Studio).

    npm install
    npx cap add android
    npx cap sync
    cd android && ./gradlew assembleDebug

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Собрать APK без Android Studio

Запушить репозиторий на GitHub — workflow `.github/workflows/android.yml`
соберёт debug-APK и положит его в артефакты сборки
(вкладка Actions → нужный запуск → Artifacts → climbkit-debug-apk).

Сборка занимает 5–10 минут. APK подписан отладочным ключом: ставится
и работает, но при установке Android предупредит о неизвестном источнике.

## Структура

    www/index.html   оболочка, стили, спрайт иконок
    www/i18n.js      словарь ru/en
    www/app.js       вся логика
    CLAUDE.md        контекст проекта: решения, модель данных, что делать дальше
