# Source Authority Policy

Use primary Japanese official sources first.

## Priority Order

1. e-Gov法令検索 (laws)
2. Ministry/agency official publications (MHLW, NTA, FSA, JP Pension Service, etc.)
3. Public institution implementation guides (official FAQs, notices)
4. Secondary summaries only for orientation, never as final authority

## Verification Rules

- Capture publication/update date and effective date separately.
- Record fiscal-year applicability when thresholds change annually.
- Keep raw citation URL for each rule entry.
- Mark uncertain items with `ASSUMPTION:` and block auto-merge of those rules.

## Mandatory Fields per Rule

- rule_id
- domain (pension/tax/social_insurance/investment_account)
- effective_from
- effective_to (optional)
- eligibility
- formula
- parameters
- source_url
- last_verified
