# Social Insurance Rules Template (Japan)

## Start Here (minimum required numbers)

- Health insurance premium rate
- Nursing care insurance applicability age/rate
- Employee pension premium split
- Employment insurance rate

## Rule Block Template

- rule_id:
- effective_from:
- effective_to:
- insurance_type: (health / nursing_care / employment / pension_contribution)
- eligibility:
- premium_formula:
- employee_employer_split:
- cap_floor_rules:
- source_url:
- last_verified:

## Required Checks

- Standard monthly remuneration bands and annual revisions
- Age-based nursing care applicability
- Employment insurance industry-rate differences
- Mid-year employment status changes and proration behavior

## Official Source Candidates

- MHLW social insurance: https://www.mhlw.go.jp/
- Kyokai Kenpo premium rates: https://www.kyoukaikenpo.or.jp/g7/cat330/
- MHLW employment insurance: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/hoken/

## Baseline Filled Rules (as of 2026-02-18)

- rule_id: si-health-rate-kyokai-tokyo-r7
- effective_from: 2025-03-01
- effective_to:
- insurance_type: health
- eligibility: 協会けんぽ一般保険（東京都支部の例）
- premium_formula: 標準報酬月額 * 9.91%
- employee_employer_split: 労使折半（被保険者4.955% / 事業主4.955%）
- cap_floor_rules: 標準報酬月額等級・標準賞与額上限を適用
- source_url: https://www.kyoukaikenpo.or.jp/g7/cat330/sb3130/r7/25029/
- last_verified: 2026-02-18

- rule_id: si-nursing-care-rate-kyokai-r7
- effective_from: 2025-03-01
- effective_to:
- insurance_type: nursing_care
- eligibility: 40歳以上65歳未満の医療保険加入者
- premium_formula: 標準報酬月額 * 1.59%
- employee_employer_split: 労使折半（被保険者0.795% / 事業主0.795%）
- cap_floor_rules: 標準報酬月額等級・標準賞与額上限を適用
- source_url: https://www.kyoukaikenpo.or.jp/shibu/nagasaki/cat080/2025020701/
- last_verified: 2026-02-18

- rule_id: si-employee-pension-contribution-rate
- effective_from: 2017-09-01
- effective_to:
- insurance_type: pension_contribution
- eligibility: 厚生年金被保険者
- premium_formula: 標準報酬月額 * 18.3%
- employee_employer_split: 労使折半（被保険者9.15% / 事業主9.15%）
- cap_floor_rules: 標準報酬月額等級・標準賞与額上限を適用
- source_url: https://www.nenkin.go.jp/service/kounen/hokenryo-gaku/hokenryo.html
- last_verified: 2026-02-18

- rule_id: si-employment-insurance-general-r7
- effective_from: 2025-04-01
- effective_to:
- insurance_type: employment
- eligibility: 雇用保険一般の事業
- premium_formula: 賃金総額 * 14.5/1000
- employee_employer_split: 被保険者5.5/1000 + 事業主9/1000
- cap_floor_rules: 事業区分（一般・農林水産清酒製造・建設）で率が異なる
- source_url: https://www.mhlw.go.jp/content/001407310.pdf
- last_verified: 2026-02-18
