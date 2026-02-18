# Investment Account Rules Template (Japan)

## Rule Block Template

- rule_id:
- effective_from:
- effective_to:
- account_type: (nisa_tsumitate / nisa_growth / ideco)
- eligibility:
- contribution_limit_formula:
- tax_treatment:
- withdrawal_constraints:
- source_url:
- last_verified:

## Start Here (minimum required numbers)

- NISA annual limit (tsumitate)
- NISA annual limit (growth)
- NISA lifetime total framework if modeled
- iDeCo contribution caps by insured category

## Required Checks

- Age and residency eligibility
- Contribution cap branching by worker category
- Mid-year contribution change behavior
- Tax treatment at contribution, holding, and withdrawal

## Official Source Candidates

- JSDA NISA portal: https://www.jsda.or.jp/nisa/
- iDeCo official: https://www.ideco-koushiki.jp/
- Financial Services Agency: https://www.fsa.go.jp/

## Baseline Filled Rules (as of 2026-02-18)

- rule_id: inv-nisa-eligibility-new-nisa
- effective_from: 2024-01-01
- effective_to:
- account_type: nisa_tsumitate/nisa_growth
- eligibility: 日本居住の18歳以上
- contribution_limit_formula: 年間上限=つみたて120万円 + 成長投資240万円（併用可）
- tax_treatment: 運用益・配当等が非課税
- withdrawal_constraints: 払出し自由、非課税保有限度額は再利用可（簿価残高方式）
- source_url: https://www.fsa.go.jp/policy/nisa2/about/nisa/index.html
- last_verified: 2026-02-18

- rule_id: inv-nisa-lifetime-limit-new-nisa
- effective_from: 2024-01-01
- effective_to:
- account_type: nisa_tsumitate/nisa_growth
- eligibility: 新NISA口座開設者
- contribution_limit_formula: 生涯非課税保有限度額=1,800万円（うち成長投資枠は1,200万円まで）
- tax_treatment: 非課税保有期間は無期限
- withdrawal_constraints: 売却後、翌年以降に簿価ベースで枠再利用
- source_url: https://www.fsa.go.jp/policy/nisa2/about/nisa/index.html
- last_verified: 2026-02-18

- rule_id: inv-ideco-contribution-cap-company-employee
- effective_from: 2024-12-01
- effective_to:
- account_type: ideco
- eligibility: 会社員（第2号被保険者）
- contribution_limit_formula: 企業年金なし=月23,000円; 企業年金あり=月20,000円; DB等+iDeCo合計で月55,000円上限
- tax_treatment: 掛金全額所得控除、運用益非課税、受取時は退職所得控除または公的年金等控除
- withdrawal_constraints: 原則60歳まで引出不可（通算加入者等期間要件あり）
- source_url: https://www.ideco-koushiki.jp/guide/
- last_verified: 2026-02-18

- rule_id: inv-ideco-contribution-cap-self-employed
- effective_from: 2024-12-01
- effective_to:
- account_type: ideco
- eligibility: 自営業者等（第1号被保険者）
- contribution_limit_formula: 月68,000円（国民年金基金等との合算上限）
- tax_treatment: 掛金全額所得控除、運用益非課税、受取時は所定控除適用
- withdrawal_constraints: 原則60歳まで引出不可
- source_url: https://www.ideco-koushiki.jp/guide/
- last_verified: 2026-02-18
