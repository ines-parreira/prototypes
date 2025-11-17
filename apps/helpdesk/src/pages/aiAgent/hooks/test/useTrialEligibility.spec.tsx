import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { useFlag } from 'core/flags'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import * as aiSalesAgentTrialUtils from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from '../useTrialEligibility'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const isAtLeastOneStoreEligibleForTrialSpy = jest.spyOn(
    aiSalesAgentTrialUtils,
    'isAtLeastOneStoreEligibleForTrial',
)

const storeActivations = {
    store1: {
        configuration: {
            scopes: [],
            salesDeactivatedDatetime: null,
            salesPersuasionLevel: null,
            salesDiscountStrategyLevel: null,
            salesDiscountMax: null,
            chatChannelDeactivatedDatetime: null,
        },
        support: {
            chat: {
                isIntegrationMissing: false,
            },
        },
    },
    store2: {
        configuration: {
            scopes: [],
            salesDeactivatedDatetime: null,
            salesPersuasionLevel: null,
            salesDiscountStrategyLevel: null,
            salesDiscountMax: null,
            chatChannelDeactivatedDatetime: null,
        },
        support: {
            chat: {
                isIntegrationMissing: true,
            },
        },
    },
} as unknown as Record<string, StoreActivation>

describe('useTrialEligibility', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should return loading state correctly', async () => {
        const storeActivations = {}
        const isOnUsd5Plan = false
        const isCurrentUserTeamLead = false

        const { result } = renderHook(() =>
            useTrialEligibility(
                storeActivations,
                isOnUsd5Plan,
                isCurrentUserTeamLead,
            ),
        )
        await waitFor(() => {
            expect(result.current).toEqual({
                canStartTrial: false,
                isLoading: true,
            })
        })
    })

    it('should return eligibility state correctly', async () => {
        const isOnUsd5Plan = true
        const isCurrentUserTeamLead = true

        const mockGetMembership = jest.fn().mockResolvedValue(['FADCAHMBM2'])
        window.Candu = { getMembership: mockGetMembership } as any

        const { result } = renderHook(() =>
            useTrialEligibility(
                storeActivations,
                isOnUsd5Plan,
                isCurrentUserTeamLead,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                canStartTrial: true,
                isLoading: false,
            })
        })
    })

    it('should return false if error on isAtLeastOneStoreEligibleForTrial', async () => {
        const isOnUsd5Plan = true
        const isCurrentUserTeamLead = true
        isAtLeastOneStoreEligibleForTrialSpy.mockRejectedValue(
            new Error('Error'),
        )

        const { result } = renderHook(() =>
            useTrialEligibility(
                storeActivations,
                isOnUsd5Plan,
                isCurrentUserTeamLead,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                canStartTrial: false,
                isLoading: false,
            })
        })
    })
})

describe('useTrialEligibilityForManualActivationFromFeatureFlag', () => {
    it('should return eligibility state correctly', async () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                false,
        )

        const isOnUsd5Plan = true
        const isCurrentUserTeamLead = true

        const { result } = renderHook(() =>
            useTrialEligibilityForManualActivationFromFeatureFlag(
                storeActivations,
                isOnUsd5Plan,
                isCurrentUserTeamLead,
            ),
        )

        expect(result.current).toEqual({
            canStartTrial: true,
        })
    })

    it('should return false if feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        const isOnUsd5Plan = true
        const isCurrentUserTeamLead = true

        const { result } = renderHook(() =>
            useTrialEligibilityForManualActivationFromFeatureFlag(
                storeActivations,
                isOnUsd5Plan,
                isCurrentUserTeamLead,
            ),
        )
        expect(result.current).toEqual({
            canStartTrial: false,
        })
    })
})
