import { renderHook } from 'utils/testing/renderHook'

import { useLowestPotentialImpact } from '../hooks/useLowestPotentialImpact'
import * as potentialImpactModule from '../hooks/usePotentialImpact'

jest.mock('../hooks/usePotentialImpact', () => ({
    ...jest.requireActual('../hooks/usePotentialImpact'),
    computeRoundedPotentialImpact: jest.fn(),
    getCurrencyFormatter: () => ({ format: (n: number) => `$${n}` }),
}))

const computeRoundedPotentialImpact =
    potentialImpactModule.computeRoundedPotentialImpact as jest.Mock

describe('useLowestPotentialImpact', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns null if no groups', () => {
        const { result } = renderHook(() => useLowestPotentialImpact([]))
        expect(result.current).toBeNull()
    })

    it('returns null if all groups have no GMV', () => {
        const { result } = renderHook(() =>
            useLowestPotentialImpact([
                { gmv: undefined, estimatedInfluencedGMV: 100 },
                { gmv: [], estimatedInfluencedGMV: 200 },
            ]),
        )
        expect(result.current).toBeNull()
    })

    it('returns formatted impact for a single group', () => {
        computeRoundedPotentialImpact.mockReturnValue({ lowerImpact: 500 })
        const { result } = renderHook(() =>
            useLowestPotentialImpact([
                {
                    gmv: [[{ dateTime: '2024-01-01', value: 1000 }]],
                    estimatedInfluencedGMV: 100,
                },
            ]),
        )
        expect(result.current).toBe(
            'boosting sales by up to $500 of additional GMV.',
        )
    })

    it('returns the lowest formatted impact among multiple groups', () => {
        computeRoundedPotentialImpact
            .mockReturnValueOnce({ lowerImpact: 500 })
            .mockReturnValueOnce({ lowerImpact: 200 })
            .mockReturnValueOnce({ lowerImpact: 800 })
        const { result } = renderHook(() =>
            useLowestPotentialImpact([
                {
                    gmv: [[{ dateTime: '2024-01-01', value: 1000 }]],
                    estimatedInfluencedGMV: 100,
                },
                {
                    gmv: [[{ dateTime: '2024-01-02', value: 2000 }]],
                    estimatedInfluencedGMV: 200,
                },
                {
                    gmv: [[{ dateTime: '2024-01-03', value: 3000 }]],
                    estimatedInfluencedGMV: 300,
                },
            ]),
        )
        expect(result.current).toBe(
            'boosting sales by up to $200 of additional GMV.',
        )
    })

    it('ignores groups where lowerImpact is not a number', () => {
        computeRoundedPotentialImpact
            .mockReturnValueOnce({ lowerImpact: undefined })
            .mockReturnValueOnce({ lowerImpact: 150 })
        const { result } = renderHook(() =>
            useLowestPotentialImpact([
                {
                    gmv: [[{ dateTime: '2024-01-01', value: 1000 }]],
                    estimatedInfluencedGMV: 100,
                },
                {
                    gmv: [[{ dateTime: '2024-01-02', value: 2000 }]],
                    estimatedInfluencedGMV: 200,
                },
            ]),
        )
        expect(result.current).toBe(
            'boosting sales by up to $150 of additional GMV.',
        )
    })
})
