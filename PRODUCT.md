# PocketDiet — Product Brief

Documento vivo. Applica a PocketDiet i principi del corso di Product Management
(problema vs soluzione, early adopter, output vs outcome, Lean, interviste,
funnel AAARRR e coorti, discovery, MVP, business model).

> Regola d'oro: **innamorarsi del problema, non della soluzione.**
> Ogni nuova feature deve partire da una riga della sezione "Ipotesi" e chiudersi con una metrica.

---

## 1. Il problema

**Chi segue una dieta prescritta dal nutrizionista fatica a seguirla nella vita di tutti i giorni**, perché:

- il piano arriva come PDF o foglio stampato, pensato per essere letto una volta e non consultato al momento del pasto;
- capire *cosa mangio oggi* richiede di scorrere settimane, alternative e grammature;
- tra una visita e l'altra non c'è un modo semplice per sapere quanto la si è seguita davvero.

Cosa **non** è il problema (rischio "penna da 1.000.000 $"): non manca un'app che crei diete,
conti calorie o sostituisca il nutrizionista. Il piano esiste già: manca il modo di *usarlo*.

## 2. Early adopter

Ha il problema, sa di averlo e ha già provato a risolverlo con mezzi di fortuna.

- Ha un piano alimentare da un nutrizionista (in PDF/foto), in corso o appena ricevuto.
- Lo consulta più volte al giorno dal telefono, o lo ha stampato e attaccato al frigo.
- Fa la spesa per la settimana e deve ricavare la lista dal piano.
- Ha un controllo periodico e vuole arrivarci con qualcosa da mostrare.

Da validare con le interviste (sezione 6): *quanto spesso* apre il PDF, *cosa fa* quando un
alimento non c'è, *come* ricostruisce la lista della spesa oggi.

## 3. Proposta di valore

> La dieta del tuo nutrizionista, sempre in tasca: il pasto di oggi in un tocco,
> la lista della spesa pronta, e un report da portare alla prossima visita.

## 4. Output vs Outcome

| Output (cosa rilasciamo) | Outcome (cosa cambia per l'utente) | Come lo misuriamo |
|---|---|---|
| Upload PDF/foto con AI | L'utente ha il piano usabile in < 1 minuto | `diet_upload_succeeded` / `diet_upload_started`, `seconds` |
| Check-in dei pasti | L'utente segue il piano ogni giorno | giorni con `meal_checkin_day` per utente |
| Promemoria serale | Torna anche nei giorni "difficili" | retention coorti con/senza `reminder_toggled` |
| Lista della spesa | Fa la spesa senza ricalcolare a mano | `shopping_list_shared` |
| Report adesione | Arriva alla visita con dati concreti | `report_shared` |

**North Star Metric (proposta):** numero settimanale di *giorni-dieta tracciati*
(utenti × giorni con almeno un `meal_checkin_day`). Cresce solo se le persone
usano davvero il piano, non se scaricano l'app e la abbandonano.

## 5. Metriche: funnel AAARRR

Tutti gli eventi sono in `src/utils/productMetrics.ts` e vanno su Vercel Web Analytics
(custom events, solo in produzione). Ogni evento porta sempre:

- `stage` — step del funnel;
- `cohort` — settimana ISO del primo accesso (`2026-W47`), oppure `legacy` per chi
  aveva già una dieta prima dell'introduzione delle metriche. **Ogni utente sta in una sola coorte.**
- `day` — giorni dal primo accesso;
- `standalone` — app installata o browser.

| Step | Definizione (metrica) | Evento |
|---|---|---|
| Awareness | Visitatori unici della home marketing / pagina upload | `landing_viewed` (`source` = utm_source), `upload_page_viewed` |
| Acquisition | Utenti che caricano con successo la prima dieta | `acquired` (una tantum). Diagnostica: `diet_upload_started`, `diet_upload_failed` (`reason`, `fileKind`), `diet_upload_succeeded` |
| Activation | Utenti che segnano com'è andato il primo pasto | `activated` (una tantum) |
| Retention | Utenti attivi in **≥ 3 giorni distinti nei primi 14** | `retained` (una tantum). Supporto: `app_active_day`, `meal_checkin_day`, `app_installed`, `reminder_toggled` |
| Referral | Utenti che portano PocketDiet fuori dall'app | `shopping_list_shared`, `report_shared` — i testi condivisi includono un link con UTM (`utm_source=shopping_list` / `adherence_report`), visibile poi come `source` in `landing_viewed` |
| Revenue | — | Non ancora definita: vedi sezione 8 |

Le soglie di retention sono costanti in `productMetrics.ts`
(`RETENTION_MIN_ACTIVE_DAYS`, `RETENTION_WINDOW_DAYS`).

### Come leggere i dati

1. **Tassi, non totali.** Calcola ogni step sia rispetto ad Awareness (visione d'insieme)
   sia rispetto allo step precedente (dove intervenire). Le somme cumulative sono vanity metrics.
2. **Per coorte.** Filtra per `cohort` e confronta le settimane prima/dopo un rilascio:
   è l'unico modo per isolare l'impatto di una modifica.
3. **Volumi bassi = bussola, non GPS.** Con poche decine di utenti a settimana non
   ottimizzare punti percentuali: guarda il drop più grande e parla con gli utenti.

Template di lettura settimanale:

| Coorte | Awareness | Acquisition | Activation | Retention | Referral |
|---|---|---|---|---|---|
| 2026-W47 | 100% | …% | …% | …% | …% |

### Feedback qualitativo (in-app)

Dopo 3 giorni attivi compare una card (`ProductFeedbackCard`), una sola volta:

1. **Sean Ellis test** — "Come ti sentiresti se domani non potessi più usare PocketDiet?"
   (`pmf_survey_answered`). Soglia indicativa di product/market fit: **≥ 40% "Molto deluso/a"**.
2. **Domanda sul problema, su comportamenti passati** — "Prima di PocketDiet, come consultavi la dieta?"
   (`problem_survey_answered`). Valida chi è davvero l'early adopter.
3. **Invito a intervista** (`interview_cta_clicked`) via email.

Solo risposte a scelta chiusa: nessun testo libero né dato personale negli analytics.

## 6. Interviste utente (script)

Obiettivo: capire il problema, **non** farsi validare la soluzione. Domande su fatti passati,
mai ipotetiche ("useresti…?"). 15 minuti, una persona alla volta.

1. Raccontami l'ultima volta che hai dovuto capire cosa mangiare a pranzo seguendo la dieta.
2. Dove avevi il piano in quel momento? Cosa hai fatto, passo per passo?
3. Qual è stata la parte più scomoda? Cosa hai fatto per aggirarla?
4. L'ultima volta che hai fatto la spesa per la dieta: come hai deciso cosa comprare?
5. Cosa hai mostrato al nutrizionista all'ultimo controllo? Lui/lei cosa ti ha chiesto?
6. Hai provato altre app o metodi? Perché li hai lasciati?
7. C'è qualcuno che conosci con lo stesso problema? *(referral + nuovi intervistati)*

Dopo ogni intervista: annotare problemi (non richieste di feature) e la frequenza con cui si ripetono.

## 7. Ipotesi aperte (Lean: Build → Measure → Learn)

Formato: *Crediamo che [azione] per [utente] porterà a [outcome]. Lo sapremo quando [metrica].*

| # | Ipotesi | Metrica di successo | Stato |
|---|---|---|---|
| H1 | Chi riceve il piano in PDF lo carica se il primo upload riesce al primo colpo | `acquired` / `diet_upload_started` ≥ 70% | Da misurare |
| H2 | Il check-in dei pasti è il momento "aha": chi lo fa almeno una volta torna | retention di chi ha `activated` vs chi no, per coorte | Da misurare |
| H3 | Il promemoria serale aumenta la retention | retention coorti con `reminder_toggled enabled=true` vs senza | Da misurare |
| H4 | Il report condiviso col nutrizionista porta nuovi utenti (canale B2B2C) | `landing_viewed source=adherence_report` | Da misurare |
| H5 | La lista della spesa condivisa porta nuovi utenti in famiglia | `landing_viewed source=shopping_list` | Da misurare |

Una sola ipotesi alla volta per sprint, sullo step del funnel con il drop maggiore.

## 8. MVP e business model

**Cosa fa parte dell'MVP** (il minimo per testare il valore): upload dieta → pasto di oggi →
check-in → promemoria. Lista spesa e report sono già a supporto di retention e referral.

**Cosa NON costruire finché le metriche non lo chiedono:** conteggio calorie, generazione di
diete, social, ricette. Ogni richiesta di feature va ricondotta al problema che c'è sotto.

**Revenue — ipotesi da validare, non da implementare:**

- *B2C freemium:* gratis la consultazione; a pagamento storico oltre 30 giorni, report avanzati.
- *B2B2C nutrizionisti:* il nutrizionista consegna il piano direttamente in PocketDiet e riceve
  i report di adesione dei pazienti. Il segnale da osservare prima è H4.

Prima di scegliere: Activation e Retention devono essere stabili per almeno 4 coorti consecutive.
