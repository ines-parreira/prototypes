import {renderHook, act} from '@testing-library/react-hooks'
import React, {ReactNode} from 'react'

import * as ContextModule from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import {useOnboarding} from '../useOnboarding'

// Mock the hooks
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const wrapper = ({children}: {children: ReactNode}) => (
    <ContextModule.OnboardingContextProvider>
        {children}
    </ContextModule.OnboardingContextProvider>
)

describe('useOnboarding', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
    })

    it('initial step is 0', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        expect(result.current.currentStep).toBe(0)
    })

    it('nextStep increments the step', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        act(() => {
            result.current.nextStep()
        })
        expect(result.current.currentStep).toBe(1)
    })

    it('prevStep decrements the step', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        act(() => {
            result.current.nextStep()
        })
        act(() => {
            result.current.prevStep()
        })
        expect(result.current.currentStep).toBe(0)
    })

    it('totalSteps is calculated correctly', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        expect(result.current.totalSteps).toBeGreaterThan(0)
    })

    it('render works correctly', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        expect(result.current.render()).toBeTruthy()
    })

    it('navigates through all steps correctly', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        const totalSteps = result.current.totalSteps

        for (let i = 0; i < totalSteps - 1; i++) {
            act(() => {
                result.current.nextStep()
            })
            expect(result.current.currentStep).toBe(i + 1)
            expect(result.current.render()).toBeTruthy()
        }

        for (let i = totalSteps - 1; i > 0; i--) {
            act(() => {
                result.current.prevStep()
            })
            expect(result.current.currentStep).toBe(i - 1)
            expect(result.current.render()).toBeTruthy()
        }
    })

    it('does not go beyond the first step', () => {
        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        act(() => {
            result.current.prevStep()
        })
        expect(result.current.currentStep).toBe(0)
    })

    it('does not go beyond the last step', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: undefined,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: undefined,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )
        const totalSteps = result.current.totalSteps

        for (let i = 0; i < totalSteps; i++) {
            act(() => {
                result.current.nextStep()
                expect(result.current.render()).not.toBeNull()
            })
        }
        expect(result.current.currentStep).toBe(totalSteps - 1)
    })

    it('should have 9 steps when scope is SALES and SUPPORT without integrations', () => {
        // Mock the context provider values
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: undefined,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: undefined,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(8)
    })

    it('should have 7 steps when scope is SALES without integrations', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SALES],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: undefined,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: undefined,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(8)
    })

    it('should have 7 steps when scope is SUPPORT without integrations', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: undefined,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: undefined,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(7)
    })

    it('should have 6 steps when scope is ONE without EMAIL integration', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: undefined,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(6)
    })

    it('should have 6 steps when scope is ONE without SHOPIFY integration', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: undefined,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(6)
    })

    it('should have 5 steps when scope is ONE with all integrations', () => {
        const spyInstance = jest.spyOn(
            ContextModule,
            'useOnboardingContext'
        ) as jest.SpyInstance
        spyInstance.mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
        })
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: undefined,
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        expect(result.current.totalSteps).toBe(5)
    })

    it('updates lastStep on nextStep', () => {
        const setOnboardingData = jest.fn()
        jest.spyOn(ContextModule, 'useOnboardingContext').mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
            lastStep: WizardStepEnum.SKILLSET,
            setOnboardingData,
            getOnboardingData: jest.fn(),
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        act(() => {
            result.current.nextStep()
        })

        expect(setOnboardingData).toHaveBeenCalledWith({
            lastStep: WizardStepEnum.CHANNELS,
        })
    })

    it('updates lastStep on prevStep', () => {
        const setOnboardingData = jest.fn()
        jest.spyOn(ContextModule, 'useOnboardingContext').mockReturnValue({
            scope: [AiAgentScopes.SUPPORT],
            lastStep: WizardStepEnum.SKILLSET,
            setOnboardingData,
            getOnboardingData: jest.fn(),
        })

        const {result} = renderHook(
            () => useOnboarding({shopName: 'testShop'}),
            {wrapper}
        )

        act(() => {
            result.current.nextStep()
        })
        act(() => {
            result.current.prevStep()
        })

        expect(setOnboardingData).toHaveBeenCalledWith({
            lastStep: WizardStepEnum.SKILLSET,
        })
    })
})
