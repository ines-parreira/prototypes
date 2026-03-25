import type { ReactNode } from 'react'
import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockStore } from 'utils/testing'

import {
    OnboardingState,
    useAiAgentOnboardingState,
} from '../useAiAgentOnboardingState'
import { useStoreConfiguration } from '../useStoreConfiguration'

jest.mock('../useStoreConfiguration')

const mockUseStoreConfiguration = useStoreConfiguration as jest.Mock

describe('useAiAgentOnboardingState', () => {
    const shopName = 'Test Shop'

    beforeEach(() => {
        mockFeatureFlags({
            [FeatureFlagKey.AiAgentOnboardingWizard]: true,
        })
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: { wizard: { completedDatetime: null } },
        })
    })

    const wrapper = ({ children }: { children?: ReactNode }) => (
        <Provider store={mockStore({ currentAccount: fromJS(account) })}>
            {children}
        </Provider>
    )

    test('returns loading state when store configuration is loading', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            isLoading: true,
            storeConfiguration: undefined,
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingState(shopName),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual(OnboardingState.Loading)
    })

    test('returns onboardingWizard state when onboarding wizard is enabled and not completed', () => {
        const { result } = renderHook(
            () => useAiAgentOnboardingState(shopName),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual(OnboardingState.OnboardingWizard)
    })

    test('returns onboarded state when onboarding wizard is completed', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            storeConfiguration: { wizard: { completedDatetime: '2021-01-01' } },
        })

        const { result } = renderHook(
            () => useAiAgentOnboardingState(shopName),
            {
                wrapper,
            },
        )

        expect(result.current).toEqual(OnboardingState.Onboarded)
    })
})
