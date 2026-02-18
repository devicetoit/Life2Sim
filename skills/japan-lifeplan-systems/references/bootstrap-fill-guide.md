# Bootstrap Fill Guide (Japan Lifeplan)

This file tells you exactly what to fill first when you do not know制度 details yet.

## Goal

Build a minimum viable rule set for life-plan simulation with verifiable official sources.

## Step 1: Fill only these 12 parameters first

### Pension (public)

1. Basic old-age pension annual amount (full amount)
2. Pension claim age default (65)
3. Early claim adjustment rate
4. Deferred claim adjustment rate

### Tax

5. Income tax bracket table (national tax)
6. Basic deduction amount (national tax)
7. Salary income deduction formula
8. Resident tax standard rate (income levy)

### Social insurance

9. Health insurance premium rate (employee share handling)
10. Nursing care insurance applicability age and rate handling
11. Employee pension premium split (employee/employer)
12. Employment insurance rate (employee share)

### Investment account

13. NISA annual contribution limits (tsumitate / growth)
14. iDeCo contribution caps by insured category

Start with 1-12. Add 13-14 if your simulator includes investments.

## Step 2: Where to get each number (official sources)

- National Tax Agency (NTA): income tax rates, deductions, tax tables
  - https://www.nta.go.jp/
- Japan Pension Service: public pension rules and claim guidance
  - https://www.nenkin.go.jp/
- Ministry of Health, Labour and Welfare (MHLW): social insurance and labor insurance
  - https://www.mhlw.go.jp/
- Japan Securities Dealers Association (NISA guide) / FSA context
  - https://www.jsda.or.jp/nisa/
- iDeCo official portal
  - https://www.ideco-koushiki.jp/

Record the exact page URL used for each rule in `source_url`.

## Step 3: Copy/paste rule blocks

Use this format for every rule:

- rule_id:
- domain:
- effective_from:
- effective_to:
- eligibility:
- formula:
- parameters:
  - key:
    value:
    unit:
- source_url:
- last_verified:
- assumption: (optional)

## Step 4: Practical fill order (60 minutes)

1. Fill pension full amount and claim-age adjustments.
2. Fill income tax brackets + basic deduction.
3. Fill resident tax default rate.
4. Fill health insurance + employee pension split + employment insurance.
5. Fill NISA/iDeCo caps if needed.

## Step 5: Non-negotiable quality checks

- Do not store values without `effective_from`.
- Do not store values without `source_url`.
- If uncertain, add `assumption` and do not treat as production-ready.
- Re-check all values at least once per fiscal year.
