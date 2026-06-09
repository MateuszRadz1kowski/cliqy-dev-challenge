# SUBMISSION.md — Cliqy Dev Challenge

## Krok 3 — co zrobiłem i dlaczego

W kroku 3 zaimplementowałem system powiadomień Toast z obsługą akcji "Cofnij". Feedback wizualny po każdej akcji użytkownika jest kluczowa. Możliwość cofnięcia akcji w ciągu kilku sekund eliminuje potrzebę okna potwierdzenia, które spowalniałoby workflow. Komponent `ToastContext` oparłem na własnym, uniwersalnym rozwiązaniu które wcześniej zbudowałem w innym projekcie — zaadaptowałem go do tego zadania, dodając typy TypeScript i obsługę callbacku `onUndo`.

## AI — jak używałem narzędzi

- **Narzędzia:** Claude, Gemini Pro

**Prompt który zadziałał najlepiej:**
Przed właściwym promptem wysłałem do Claude'a pełny kontekst zadania: treść README.md z opisem wszystkich kroków i kryteriami akceptacji, plik `src/app/api/classify/route.ts`, plik `src/app/queue/page.tsx`, oraz plik `/src/types/index.ts` . Dopiero po tym wysłałem właściwy prompt:

```
Masz pełny kontekst tego zadania — README, szkielet route.ts, page.tsx, index.ts.
Zaimplementuj Krok 2: kolejkę weryfikacji w page.tsx.

Kryteria z README które muszą być spełnione:
- przyciski Zatwierdź / Odrzuć zmieniają status (pending → approved / rejected)
- przycisk Edytuj zamienia draft_reply na textarea z możliwością zapisu i anulowania
- filtrowanie po kategorii działa
- stan zarządzany przez React bez zewnętrznych bibliotek

Zostaw SEED_ITEMS i style bez zmian — zmień tylko puste funkcje handleAction,
handleEditReply i podmień statyczny <p> z draft_reply na edytowalny textarea.
Zwróć kompletny plik page.tsx gotowy do wklejenia.
```

- **Gdzie AI się pomylił i co poprawiłem ręcznie:**

  Cztery konkretne problemy które musiałem naprawić po wygenerowanym kodzie:
  1. **Brak kategorii `spam` w prompcie systemowym** — AI opisało tylko trzy kategorie (zamówienie, pytanie, reklamacja), przez co model nie klasyfikował wiadomości jako spam. Dopisałem ręcznie przykłady spamu i wyraźną instrukcję kiedy tej kategorii używać.

  2. **Brak `.trim()` w walidacji** — warunek `!body.message || !body.company` przepuszczał wiadomości złożone z samych spacji. Poprawiłem na `!body.message.trim() || !body.company.trim()`.

  3. **Brak globalnego `try/catch`** — AI owinęło tylko parsowanie JSON, ale wywołanie `openai.chat.completions.create()` było poza blokiem obsługi błędów. Przy problemach z kluczem API lub limitem zapytań serwer rzucał nieobsłużony wyjątek. Opakowałem cały handler.

  4. **Zbyt pobłażliwe zasady priorytetu** — AI wygenerowało ogólnikowy opis ("high = ważne"), przez co prawie wszystko dostawało `high`. Przepisałem reguły na baardziej konkretne.

- **Szacowany udział AI w kodzie:** 75% wygenerowane, 25% napisane lub poprawione ręcznie
