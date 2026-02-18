---
name: japan-lifeplan-systems
description: Apply authoritative Japanese pension, tax, social insurance, and investment-account rules to life-plan simulators and household financial projections. Use when building, reviewing, or updating simulation logic that depends on制度要件, 適用開始日, 給付・負担計算, iDeCo/NISA, 公的年金, 健康保険, 介護保険, 雇用保険, or income-tax/resident-tax handling in Japan.
---

# Japan Lifeplan Systems

Use this skill to keep Japanese制度ロジック correct, date-scoped, and traceable.

## Work Procedure

1. Confirm target period and household profile.
2. Read `references/source-authority.md` and restrict primary facts to official sources.
3. Read only the relevant rule template files in `references/`.
4. Encode rules with explicit effective dates and assumptions.
5. Surface unknowns as `ASSUMPTION:` lines in output.
6. Attach source URLs and confirmation date for each major rule block.

## Required Output Contract

Always provide:

- `effective_date`: rule effective date or fiscal year boundary
- `scope`: who the rule applies to
- `formula`: plain language + implementation-ready expression
- `exceptions`: edge cases and ineligibility conditions
- `sources`: official URLs
- `last_verified`: YYYY-MM-DD

## Implementation Guardrails

- Prefer parameterized rule tables over hard-coded branches.
- Separate制度データ from UI concerns.
- Version rules by date range to avoid retroactive breakage.
- Never infer thresholds without a cited source.
- When source conflict exists, prefer ministry/agency primary publication and flag conflict.

## Reference Files

- Authority and source policy: `references/source-authority.md`
- First-pass fill guide: `references/bootstrap-fill-guide.md`
- Pension template: `references/pension-rules-template.md`
- Tax template: `references/tax-rules-template.md`
- Social insurance template: `references/social-insurance-template.md`
- Investment account template: `references/investment-account-template.md`

Load only the files needed for the current task.
