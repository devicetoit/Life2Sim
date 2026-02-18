# Tax Rules Template (Japan)

## Start Here (minimum required numbers)

- National income tax brackets
- Basic deduction
- Salary income deduction formula
- Resident tax standard rate (income levy)

## Rule Block Template

- rule_id:
- effective_from:
- effective_to:
- tax_type: (income_tax / resident_tax / special_reconstruction_tax)
- filing_unit:
- taxable_base_formula:
- deduction_rules:
- rate_table:
- credits:
- source_url:
- last_verified:

## Required Checks

- Salary income deduction and basic deduction updates
- Dependents and spouse-related deductions
- Capital gains treatment and loss carry-forward constraints
- Local-tax timing mismatch vs national-tax settlement timing

## Official Source Candidates

- NTA portal: https://www.nta.go.jp/
- Income tax rates page (index): https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
- Basic deduction (index): https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm

## Baseline Filled Rules (as of 2026-02-18)

- rule_id: tax-income-brackets-national
- effective_from: 2013-01-01
- effective_to:
- tax_type: income_tax
- filing_unit: individual
- taxable_base_formula: 課税所得 = 総所得金額等 - 所得控除
- deduction_rules: 基礎控除・給与所得控除等を適用後の課税所得に累進税率を適用
- rate_table: 1,000円-1,949,000円=5%/控除0円; 1,950,000円-3,299,000円=10%/控除97,500円; 3,300,000円-6,949,000円=20%/控除427,500円; 6,950,000円-8,999,000円=23%/控除636,000円; 9,000,000円-17,999,000円=33%/控除1,536,000円; 18,000,000円-39,999,000円=40%/控除2,796,000円; 40,000,000円以上=45%/控除4,796,000円
- credits: 復興特別所得税=基準所得税額*2.1%（2037-12-31まで）
- source_url: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
- last_verified: 2026-02-18

- rule_id: tax-basic-deduction-national
- effective_from: 2020-01-01
- effective_to:
- tax_type: income_tax
- filing_unit: individual
- taxable_base_formula: 合計所得金額に応じた基礎控除
- deduction_rules: 2,400万円以下=48万円; 2,400万円超2,450万円以下=32万円; 2,450万円超2,500万円以下=16万円; 2,500万円超=0円
- rate_table:
- credits:
- source_url: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
- last_verified: 2026-02-18

- rule_id: tax-salary-income-deduction-national
- effective_from: 2020-01-01
- effective_to:
- tax_type: income_tax
- filing_unit: individual
- taxable_base_formula: 給与所得 = 給与収入 - 給与所得控除
- deduction_rules: 収入1,625,000円以下=55万円; 1,625,001-1,799,999円=収入*40%-10万円; 1,800,000-3,599,999円=収入*30%+8万円; 3,600,000-6,599,999円=収入*20%+44万円; 6,600,000-8,499,999円=収入*10%+110万円; 8,500,000円超=195万円
- rate_table:
- credits:
- source_url: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
- last_verified: 2026-02-18

- rule_id: tax-resident-standard-rate-model
- effective_from: 2007-01-01
- effective_to:
- tax_type: resident_tax
- filing_unit: individual
- taxable_base_formula: 住民税課税所得 = 所得金額 - 所得控除（住民税ルール）
- deduction_rules: 多くの自治体で所得割は都道府県民税4% + 市町村民税6%の合計10%
- rate_table: 標準モデル=10%（自治体で超過課税・均等割額は差異あり）
- credits:
- source_url: https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/ich_ich.html
- last_verified: 2026-02-18
