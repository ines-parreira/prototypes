import type { RootState } from 'state/types'

import {
    getCompanyFixedGmvBandTier,
    getCurrentCompanyState,
} from '../selectors'
import { CompanyTier } from '../types'

describe('currentCompany selectors', () => {
    const mockCompanyData = {
        fixed_gmv_band: CompanyTier.Tier3,
    }

    const defaultState = {
        currentCompany: mockCompanyData,
    } as Partial<RootState> as RootState

    describe('getCurrentCompanyState', () => {
        it('should return the currentCompany state', () => {
            expect(getCurrentCompanyState(defaultState)).toEqual(
                mockCompanyData,
            )
        })

        it('should return empty object when currentCompany is not in state', () => {
            const emptyState = {} as Partial<RootState> as RootState
            expect(getCurrentCompanyState(emptyState)).toEqual({})
        })

        it('should return empty object when currentCompany is null', () => {
            const stateWithNullCompany = {
                currentCompany: null,
            } as unknown as RootState
            expect(getCurrentCompanyState(stateWithNullCompany)).toEqual({})
        })
    })

    describe('getCompanyFixedGmvBandTier', () => {
        it('should return the fixed_gmv_band value', () => {
            expect(getCompanyFixedGmvBandTier(defaultState)).toBe(
                CompanyTier.Tier3,
            )
        })

        it('should return null when fixed_gmv_band is not present', () => {
            const stateWithoutGmvBand = {
                currentCompany: {},
            } as Partial<RootState> as RootState
            expect(getCompanyFixedGmvBandTier(stateWithoutGmvBand)).toBeNull()
        })

        it('should return null when currentCompany is empty', () => {
            const emptyState = {} as Partial<RootState> as RootState
            expect(getCompanyFixedGmvBandTier(emptyState)).toBeNull()
        })

        it('should handle different tier values', () => {
            const tierValues = [
                CompanyTier.Tier1,
                CompanyTier.Tier2,
                CompanyTier.Tier3,
                CompanyTier.Tier4,
                CompanyTier.Tier5,
                CompanyTier.Tier6,
            ]

            tierValues.forEach((tier) => {
                const state = {
                    currentCompany: {
                        fixed_gmv_band: tier,
                    },
                } as Partial<RootState> as RootState
                expect(getCompanyFixedGmvBandTier(state)).toBe(tier)
            })
        })
    })
})
