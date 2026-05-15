import type { VariantDTO } from '@gorgias/convert-client'

export type MessageInstructionsVariant = VariantDTO

export const MIN_VARIANT_WEIGHT = 1
export const MIN_CONTROL_WEIGHT = 1
export const MAX_TOTAL_WEIGHT = 100

export const sumVariantWeights = (variants: MessageInstructionsVariant[]) =>
    variants.reduce((acc, v) => acc + (Number(v.weight) || 0), 0)

export const computeControlWeight = (variants: MessageInstructionsVariant[]) =>
    Math.max(MIN_CONTROL_WEIGHT, MAX_TOTAL_WEIGHT - sumVariantWeights(variants))

export const remainingWeightFor = (
    variants: MessageInstructionsVariant[],
    excludeIndex?: number,
) =>
    MAX_TOTAL_WEIGHT -
    MIN_CONTROL_WEIGHT -
    variants.reduce(
        (acc, v, i) =>
            i === excludeIndex ? acc : acc + (Number(v.weight) || 0),
        0,
    )
