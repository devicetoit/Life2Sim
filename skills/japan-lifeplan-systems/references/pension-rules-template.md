# Pension Rules Template (Japan)

## Start Here (minimum required numbers)

- Old-age basic pension full annual amount
- Claim age default
- Early claim adjustment rate
- Deferred claim adjustment rate

## Rule Block Template

- rule_id:
- effective_from:
- effective_to:
- pension_type: (old-age / disability / survivor / public / private)
- eligibility:
- benefit_formula:
- adjustment_factors: (indexation, deferral, early claim, etc.)
- notes:
- source_url:
- last_verified:

## Required Checks

- Contribution period minimums
- Category transitions (被保険者区分)
- Macroeconomic slide or annual revision handling
- Spouse/survivor branching

## Official Source Candidates

- Japan Pension Service: https://www.nenkin.go.jp/
- MHLW pensions: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/nenkin/nenkin/index.html

## Baseline Filled Rules (as of 2026-02-18)

- rule_id: pension-old-age-basic-full-amount-r7
- domain: pension
- effective_from: 2025-04-01
- effective_to:
- pension_type: old-age/public
- eligibility: 保険料納付済期間と免除期間等の合算10年以上、原則65歳受給開始
- benefit_formula: 老齢基礎年金（満額）= 69,308円/月（昭和31年4月2日以後生まれ）
- adjustment_factors: 毎年度改定あり
- notes: 年額換算は 69,308 * 12 = 831,696円
- source_url: https://www.nenkin.go.jp/oshirase/taisetu/2025/202504/040102.html
- last_verified: 2026-02-18

- rule_id: pension-claim-age-default
- domain: pension
- effective_from: 2022-04-01
- effective_to:
- pension_type: old-age/public
- eligibility: 老齢基礎年金
- benefit_formula: 受給開始基準年齢 = 65歳（繰上げ・繰下げ選択可）
- adjustment_factors: 通算加入期間10年以上要件
- notes:
- source_url: https://www.nenkin.go.jp/service/yougo/ragyo/roureikisonenkin.html
- last_verified: 2026-02-18

- rule_id: pension-early-claim-adjustment
- domain: pension
- effective_from: 2022-04-01
- effective_to:
- pension_type: old-age/public
- eligibility: 繰上げ請求者
- benefit_formula: 減額率 = 0.4% * 繰上げ月数（昭和37年4月2日以降生まれ、最大24%）
- adjustment_factors: 昭和37年4月1日以前生まれは0.5%（最大30%）
- notes: 減額率は生涯固定
- source_url: https://www.nenkin.go.jp/service/jukyu/seido/roureinenkin/kuriage-kurisage/20140421-01.html
- last_verified: 2026-02-18

- rule_id: pension-deferred-claim-adjustment
- domain: pension
- effective_from: 2022-04-01
- effective_to:
- pension_type: old-age/public
- eligibility: 繰下げ申出者
- benefit_formula: 増額率 = 0.7% * (65歳到達月から申出月前月までの月数)、最大84%
- adjustment_factors: 一部生年月日区分は上限70歳・最大42%
- notes: 増額率は生涯固定
- source_url: https://www.nenkin.go.jp/service/jukyu/seido/roureinenkin/kuriage-kurisage/20140421-02.html
- last_verified: 2026-02-18
