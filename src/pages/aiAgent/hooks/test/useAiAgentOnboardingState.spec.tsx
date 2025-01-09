import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'

import {mockStore} from 'utils/testing'

import {
    OnboardingState,
    useAiAgentOnboardingState,
} from '../useAiAgentOnboardingState'
import {useStoreConfiguration} from '../useStoreConfiguration'
import {useWelcomePageAcknowledged} from '../useWelcomePageAcknowledged'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../useStoreConfiguration')
jest.mock('../useWelcomePageAcknowledged')

const mockUseStoreConfiguration = useStoreConfiguration as jest.Mock
const mockUseWelcomePageAcknowledged = useWelcomePageAcknowledged as jest.Mock

describe('useAiAgentOnboardingState', () => {
    const shopName = 'Test Shop'
    const mockedFlags = {
        [FeatureFlagKey.AIAgentWelcomePage]: 'dynamic_odd_static_even',
        [FeatureFlagKey.AiAgentOnboardingWizard]: true,
    }

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AIAgentWelcomePage]: 'dynamic_odd_static_even',
            [FeatureFlagKey.AiAgentOnboardingWizard]: true,
        })
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: {wizard: {completedDatetime: null}},
        })
        mockUseWelcomePageAcknowledged.mockReturnValue({
            isLoading: false,
            data: {acknowledged: false},
        })
    })

    const wrapper = ({children}: {children: ReactNode}) => (
        <Provider store={mockStore({currentAccount: fromJS(account)})}>
            {children}
        </Provider>
    )

    test('returns loading state when store configuration is loading', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            isLoading: true,
            storeConfiguration: undefined,
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.Loading)
    })

    test('returns loading state when welcome page acknowledged is loading', () => {
        mockUseWelcomePageAcknowledged.mockReturnValueOnce({
            isLoading: true,
            data: undefined,
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.Loading)
    })

    test('returns welcomeDynamic state when welcome page feature flag is dynamic_odd_static_even', () => {
        mockFlags({
            ...mockedFlags,
            [FeatureFlagKey.AiAgentOnboardingWizard]: false,
        })
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.WelcomeDynamic)
    })

    test('returns welcomeStatic state when welcome page feature flag is static_odd_dynamic_even', () => {
        mockFlags({
            ...mockedFlags,
            [FeatureFlagKey.AIAgentWelcomePage]: 'static_odd_dynamic_even',
            [FeatureFlagKey.AiAgentOnboardingWizard]: false,
        })
        mockUseStoreConfiguration.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.WelcomeStatic)
    })

    test('returns onboardingWizard state when onboarding wizard is enabled and not completed', () => {
        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.OnboardingWizard)
    })

    test('returns onboarded state when onboarding wizard is completed', () => {
        mockUseStoreConfiguration.mockReturnValueOnce({
            storeConfiguration: {wizard: {completedDatetime: '2021-01-01'}},
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.Onboarded)
    })

    test('returns onboarded state when ai-agent-onboarding-wizard feature flag is false', () => {
        mockFlags({
            [FeatureFlagKey.AIAgentWelcomePage]: 'dynamic_odd_static_even',
            [FeatureFlagKey.AiAgentOnboardingWizard]: false,
        })

        const {result} = renderHook(() => useAiAgentOnboardingState(shopName), {
            wrapper,
        })

        expect(result.current).toEqual(OnboardingState.Onboarded)
    })
})
