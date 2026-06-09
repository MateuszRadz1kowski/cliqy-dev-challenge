import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ClassifyRequest, ClassifyResponse } from '@/types'

// Model i limit tokenów są zablokowane — nie zmieniaj tych stałych.
const MODEL = 'gpt-4o-mini' as const
const MAX_TOKENS = 300

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// POST /api/classify

export async function POST(req: Request): Promise<NextResponse<ClassifyResponse | { error: string }>> {
  try{
  const body: ClassifyRequest = await req.json()

  //Walidacja wejścia

  if (!body.message.trim() || !body.company.trim()) {
    return NextResponse.json(
      { error: 'Pola "message" i "company" są puste.' },
      { status: 400 }
    )
  }
 
  //prompt
  const systemPrompt = `Jesteś asystentem AI obsługującym wiadomości klientów dla polskich firm.
  Klasyfikujesz wiadomość i przygotowujesz szkic odpowiedzi.
  
  Odpowiedz WYŁĄCZNIE poprawnym JSON-em o tej strukturze:
  {
    "category": "zamówienie" | "pytanie" | "reklamacja" | "spam",
    "priority": "high" | "medium" | "low",
    "draft_reply": "<gotowy szkic odpowiedzi po polsku, profesjonalny ton>",
    "confidence": <liczba 0.0–1.0>
  }
  
  Zasady określania priorytetu ("priority"):
  - "high": Bezwzględnie dla każdej wiadomości sklasyfikowanej jako "reklamacja". Dodatkowo dla "zamówienie" i "pytanie", jeśli klient jest wyraźnie zdenerwowany lub zgłasza błąd po stronie firmy.
  - "medium": Standardowe, spokojne wiadomości z kategorii "zamówienie". Również dla kategorii "pytanie", jeśli dotyczy konkretnej oferty, wyceny, dostępności produktu lub statusu wysyłki (potencjalna sprzedaż).
  - "low": Bezwzględnie dla każdej wiadomości sklasyfikowanej jako "spam". Dodatkowo dla luźnych pytań organizacyjnych (np. godziny otwarcia, lokalizacja), które nie wymagają natychmiastowej interwencji.
    
  draft_reply musi:
  - być po polsku
  - pasować tonem do kategorii (reklamacja = empatyczny, zamówienie = konkretny, pytanie = pomocny, spam = zirytowany)
  - uwzględniać nazwę firmy: ${body.company}
  - być gotowy do wysyłki (nie szablon)
  
  confidence to liczba od 0.0 do 1.0, która odzwierciedla pewność klasyfikacji i jakości szkicu odpowiedzi. Wyższa wartość oznacza większą pewność i lepszą jakość.
  `

  
  const userPrompt = `Firma: ${body.company}
  Wiadomość od klienta: ${body.message}`
 
  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })
 
  const raw = completion.choices[0]?.message?.content ?? '{}'
 
  let parsed: ClassifyResponse
  try {
    parsed = JSON.parse(raw) as ClassifyResponse
  } catch {
    return NextResponse.json({ error: 'AI zwróciło nieprawidłowy JSON.' }, { status: 500 })
  }
 
  const validCategories = ['zamówienie', 'pytanie', 'reklamacja', 'spam']
  const validPriorities = ['high', 'medium', 'low']
 
   if (
    !validCategories.includes(parsed.category) ||
    !validPriorities.includes(parsed.priority) ||
    typeof parsed.draft_reply !== 'string' ||
    typeof parsed.confidence !== 'number'
  ) {
    return NextResponse.json({ error: 'Nieprawidłowa struktura odpowiedzi AI.' }, { status: 500 })
  }

  return NextResponse.json(parsed, { status: 200})
  }
  catch (error){
    console.error('Błąd podczas klasyfikacji:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
}
