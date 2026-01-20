import type { RootState } from 'state/types'

import {
    getCompanyFixedGmvBandTier,
    getCurrentCompanyState,
} from '../selectors'
import { CompanyTier } from '../types'

describe('currentCompany selectors', () => {
    const mockCompanyData = {
        fixed_gmv_band: CompanyTier.Band1,
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
                CompanyTier.Band1,
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

        it('should handle different band values', () => {
            const bandValues = [
                CompanyTier.Band1,
                CompanyTier.Band2,
                CompanyTier.Band3,
                CompanyTier.Band4,
            ]

            bandValues.forEach((band) => {
                const state = {
                    currentCompany: {
                        fixed_gmv_band: band,
                    },
                } as Partial<RootState> as RootState
                expect(getCompanyFixedGmvBandTier(state)).toBe(band)
            })
        })
    })
})
