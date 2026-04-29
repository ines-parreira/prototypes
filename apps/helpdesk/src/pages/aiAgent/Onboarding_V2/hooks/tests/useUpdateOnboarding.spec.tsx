import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import { updateOnboardingData } from 'models/aiAgent/resources/configuration'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'

import { useUpdateOnboarding } from '../useUpdateOnboarding'

jest.mock('models/aiAgent/resources/configuration')

const updateOnboardingDataMock = assumeMock(updateOnboardingData)

const defaultOnboarding = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: shopifyIntegration.meta.shop_name,
    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
}

describe('useUpdateOnboarding', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it('should update the onboarding successfully', async () => {
        updateOnboardingDataMock.mockResolvedValue(defaultOnboarding)

        const { result } = renderHook(useUpdateOnboarding)

        result.current.mutate({
            id: '1',
            data: { currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION },
        })

        await waitFor(() => {
            expect(result.current.isLoading).toEqual(false)
        })
    })

    it('should fail when updating the onboarding and notify the user', async () => {
        updateOnboardingDataMock.mockRejectedValue({
            message: 'test',
        })

        const { result } = renderHook(useUpdateOnboarding)

        result.current.mutate({
            id: '1',
            data: { currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION },
        })

        await waitFor(() => {
            expect(result.current.isLoading).toEqual(false)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'An unexpected error occurred. Please try again.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
