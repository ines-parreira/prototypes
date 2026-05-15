import {
    computeControlWeight,
    MAX_TOTAL_WEIGHT,
    MIN_CONTROL_WEIGHT,
    remainingWeightFor,
    sumVariantWeights,
} from './types'

describe('sumVariantWeights', () => {
    it('returns 0 for an empty array', () => {
        expect(sumVariantWeights([])).toBe(0)
    })

    it('adds up numeric weights', () => {
        expect(
            sumVariantWeights([
                { id: 'a', message_instructions: '', weight: 20 },
                { id: 'b', message_instructions: '', weight: 30 },
            ]),
        ).toBe(50)
    })

    it('treats invalid weights as 0', () => {
        expect(
            sumVariantWeights([
                {
                    id: 'a',
                    message_instructions: '',
                    weight: Number.NaN,
                },
                {
                    id: 'b',
                    message_instructions: '',
                    weight: undefined as unknown as number,
                },
            ]),
        ).toBe(0)
    })
})

describe('computeControlWeight', () => {
    it('returns the full audience when there are no variants', () => {
        expect(computeControlWeight([])).toBe(MAX_TOTAL_WEIGHT)
    })

    it('returns the complement of the variant sum', () => {
        expect(
            computeControlWeight([
                { id: 'a', message_instructions: '', weight: 20 },
                { id: 'b', message_instructions: '', weight: 30 },
            ]),
        ).toBe(50)
    })

    it('clamps the control weight to the minimum when variants exceed the total', () => {
        expect(
            computeControlWeight([
                { id: 'a', message_instructions: '', weight: 200 },
            ]),
        ).toBe(MIN_CONTROL_WEIGHT)
    })
})

describe('remainingWeightFor', () => {
    it('returns the total minus the control minimum when no variants exist', () => {
        expect(remainingWeightFor([])).toBe(
            MAX_TOTAL_WEIGHT - MIN_CONTROL_WEIGHT,
        )
    })

    it('subtracts every variant when no index is excluded', () => {
        expect(
            remainingWeightFor([
                { id: 'a', message_instructions: '', weight: 20 },
                { id: 'b', message_instructions: '', weight: 30 },
            ]),
        ).toBe(MAX_TOTAL_WEIGHT - MIN_CONTROL_WEIGHT - 50)
    })

    it('skips the excluded index so a variant can be re-sized within its own headroom', () => {
        expect(
            remainingWeightFor(
                [
                    { id: 'a', message_instructions: '', weight: 50 },
                    { id: 'b', message_instructions: '', weight: 30 },
                ],
                1,
            ),
        ).toBe(MAX_TOTAL_WEIGHT - MIN_CONTROL_WEIGHT - 50)
    })
})
