/**
 * CADS Assessment & Discernment Mathematical Model
 * Strictly based on DSWD Self-Instructional Manual for Social Workers on Assessing Discernment
 * (Republic Act 9344 / Juvenile Justice and Welfare Act)
 */

export interface DiscernmentComputation {
  lmdRawMean: number
  lmdScaled: number
  lmdLabel: string
  ivjRaw: number
  ivjScaled: number
  ivjLabel: string
  combinedAverage: number
  combinedAverageStr: string
  discernmentLevel: string
  hasDiscernment: boolean | null
  isInvalid: boolean
  errorMessage?: string
  cfcScore: number
  cfcLabel: string
  cfcInvalid?: boolean
  ffcScore: number
  ffcLabel: string
  ffcInvalid?: boolean
}

/**
 * Maps LMD Mean Score (1.00 - 6.00) to Scaled Score (1 - 6) and qualitative label
 * Bounds: 1.00 to 6.00
 */
export function getLmdScaledScore(meanScore: number): { scaledScore: number; label: string; isInvalid?: boolean } {
  if (meanScore <= 0) return { scaledScore: 0, label: "Not Assessed" }
  if (meanScore > 6.00 || meanScore < 1.00) {
    return { scaledScore: 0, label: "Invalid Score (Must be 1.00 - 6.00)", isInvalid: true }
  }
  if (meanScore >= 5.51) return { scaledScore: 6, label: "Superior" }
  if (meanScore >= 4.51) return { scaledScore: 5, label: "Above Average" }
  if (meanScore >= 3.51) return { scaledScore: 4, label: "Average" }
  if (meanScore >= 2.51) return { scaledScore: 3, label: "Below Average" }
  if (meanScore >= 1.51) return { scaledScore: 2, label: "Poor" }
  return { scaledScore: 1, label: "Very Poor" }
}

/**
 * Maps IVJ Raw Correct Score (0 - 54) to Scaled Score (1 - 6) and qualitative label
 * Table:
 * 1 - 9   -> Scaled Score 1 (Very Poor)
 * 10 - 18 -> Scaled Score 2 (Poor)
 * 19 - 27 -> Scaled Score 3 (Below Average)
 * 28 - 36 -> Scaled Score 4 (Average)
 * 37 - 45 -> Scaled Score 5 (Above Average)
 * 46 - 54 -> Scaled Score 6 (Superior)
 */
export function getIvjScaledScore(rawScore: number): { scaledScore: number; label: string; isInvalid?: boolean } {
  if (rawScore < 0 || rawScore > 54) {
    return { scaledScore: 0, label: "Invalid Score (Must be 0 - 54)", isInvalid: true }
  }
  if (rawScore === 0) return { scaledScore: 0, label: "Not Assessed" }
  if (rawScore >= 46) return { scaledScore: 6, label: "Superior" }
  if (rawScore >= 37) return { scaledScore: 5, label: "Above Average" }
  if (rawScore >= 28) return { scaledScore: 4, label: "Average" }
  if (rawScore >= 19) return { scaledScore: 3, label: "Below Average" }
  if (rawScore >= 10) return { scaledScore: 2, label: "Poor" }
  return { scaledScore: 1, label: "Very Poor" }
}

/**
 * Maps Combined Scaled Score Average (1.00 - 6.00) to qualitative discernment level
 * 1.00 - 1.50 -> Very Poor
 * 1.51 - 2.50 -> Poor
 * 2.51 - 3.50 -> Below Average
 * 3.51 - 4.50 -> Average
 * 4.51 - 5.50 -> Above Average
 * 5.51 - 6.00 -> Superior
 */
export function getDiscernmentLevel(score: number): string {
  if (score <= 0) return "Not Evaluated"
  if (score > 6.00 || score < 1.00) return "Invalid Score"
  if (score >= 5.51) return "Superior"
  if (score >= 4.51) return "Above Average"
  if (score >= 3.51) return "Average"
  if (score >= 2.51) return "Below Average"
  if (score >= 1.51) return "Poor"
  return "Very Poor"
}

/**
 * CFC (Child Functioning Checklist) Interpretation
 * Mean Score: 1.00 - 4.00
 * 1.00 - 1.50 -> Very Dysfunctional
 * 1.51 - 2.50 -> Dysfunctional
 * 2.51 - 3.50 -> Functional
 * 3.51 - 4.00 -> Highly Functional
 * Lampas 4.00 -> Invalid
 */
export function getCfcDescription(score: number): string {
  if (score <= 0) return "Not Assessed"
  if (score > 4.00) return "Invalid Score (> 4.00)"
  if (score >= 3.51) return "Highly Functional"
  if (score >= 2.51) return "Functional"
  if (score >= 1.51) return "Dysfunctional"
  return "Very Dysfunctional"
}

/**
 * FFC (Family Functioning Checklist) Interpretation
 * Mean Score: 1.00 - 4.00
 * 1.00 - 1.50 -> Very Dysfunctional Family
 * 1.51 - 2.50 -> Dysfunctional Family
 * 2.51 - 3.50 -> Functional Family
 * 3.51 - 4.00 -> Highly Functional Family
 * Lampas 4.00 -> Invalid
 */
export function getFfcDescription(score: number): string {
  if (score <= 0) return "Not Assessed"
  if (score > 4.00) return "Invalid Score (> 4.00)"
  if (score >= 3.51) return "Highly Functional Family"
  if (score >= 2.51) return "Functional Family"
  if (score >= 1.51) return "Dysfunctional Family"
  return "Very Dysfunctional Family"
}

/**
 * Comprehensive calculation of all assessment tools following the DSWD Manual
 */
export function computeAssessmentResults(data: {
  lmdScore?: number // Raw mean score (1-6) or legacy raw sum
  ivjScore?: number // Raw score (0-54)
  cfcScore?: number // Mean score (1-4)
  ffcScore?: number // Mean score (1-4)
}): DiscernmentComputation {
  let lmdRawMean = data.lmdScore || 0
  const ivjRaw = data.ivjScore || 0
  const cfcScore = data.cfcScore || 0
  const ffcScore = data.ffcScore || 0

  // If LMD is passed as an un-divided raw sum of 14 dilemmas (> 6.00 and <= 84, e.g. 20.00),
  // auto-normalize to mean = sum / 14 (e.g. 20 / 14 = 1.43)
  if (lmdRawMean > 6.00 && lmdRawMean <= 84) {
    lmdRawMean = Math.round((lmdRawMean / 14) * 100) / 100
  }

  const { scaledScore: lmdScaled, label: lmdLabel, isInvalid: lmdInvalid } = getLmdScaledScore(lmdRawMean)
  const { scaledScore: ivjScaled, label: ivjLabel, isInvalid: ivjInvalid } = getIvjScaledScore(ivjRaw)

  const cfcInvalid = cfcScore > 4.00
  const ffcInvalid = ffcScore > 4.00

  // Combined Discernment: Average of scaled scores (SS) of LMD and IVJ
  let combinedAverage = 0
  if (lmdScaled > 0 && ivjScaled > 0) {
    combinedAverage = Math.round(((lmdScaled + ivjScaled) / 2) * 100) / 100
  } else if (lmdScaled > 0) {
    combinedAverage = lmdScaled
  } else if (ivjScaled > 0) {
    combinedAverage = ivjScaled
  }

  const combinedAverageStr = combinedAverage.toFixed(2)

  // Bounds validation: LMD mean [1.00, 6.00], IVJ raw [0, 54], Combined [1.00, 6.00]
  const isInvalid = Boolean(
    lmdInvalid ||
    ivjInvalid ||
    (lmdRawMean > 0 && (lmdRawMean < 1.00 || lmdRawMean > 6.00)) ||
    (ivjRaw < 0 || ivjRaw > 54) ||
    (combinedAverage > 0 && (combinedAverage < 1.00 || combinedAverage > 6.00))
  )

  let errorMessage: string | undefined = undefined
  if (isInvalid) {
    const reasons: string[] = []
    if (lmdRawMean < 1.00 || lmdRawMean > 6.00) {
      reasons.push(`LMD mean (${lmdRawMean.toFixed(2)}) lampas sa 1.00-6.00`)
    }
    if (ivjRaw < 0 || ivjRaw > 54) {
      reasons.push(`IVJ score (${ivjRaw}) lampas sa 0-54`)
    }
    if (combinedAverage < 1.00 || combinedAverage > 6.00) {
      reasons.push(`Combined score (${combinedAverageStr}) lampas sa 1.00-6.00`)
    }
    errorMessage = `Error sa computation: ${reasons.join(", ")}. Hindi maaaring magbigay ng conclusion.`
  }

  const discernmentLevel = isInvalid ? "Error (Out of Bounds)" : getDiscernmentLevel(combinedAverage)

  // Per DSWD manual & user instruction:
  // "pag lampas 1-6 yung lmd, ivj o combined, mag-error na lang, wag mag-conclusion"
  const hasDiscernment: boolean | null = isInvalid
    ? null
    : combinedAverage >= 3.51

  return {
    lmdRawMean,
    lmdScaled,
    lmdLabel,
    ivjRaw,
    ivjScaled,
    ivjLabel,
    combinedAverage,
    combinedAverageStr,
    discernmentLevel,
    hasDiscernment,
    isInvalid,
    errorMessage,
    cfcScore,
    cfcLabel: getCfcDescription(cfcScore),
    cfcInvalid,
    ffcScore,
    ffcLabel: getFfcDescription(ffcScore),
    ffcInvalid,
  }
}
