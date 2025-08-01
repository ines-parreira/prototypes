import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import { createOnboardingData } from 'models/aiAgent/resources/configuration'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useCreateOnboarding } from '../useCreateOnboarding'

jest.mock('models/aiAgent/resources/configuration')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const notifyActionMock = assumeMock(notifyAction)
const createOnboardingDataMock = assumeMock(createOnboardingData)
const useAppDispatchMock = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

const defaultOnboarding = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: shopifyIntegration.meta.shop_name,
    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
}

describe('useCreateOnboarding', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockDispatch)
        notifyActionMock.mockReturnValue(mockDispatch)
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it('should create the onboarding successfully', async () => {
        createOnboardingDataMock.mockResolvedValue(defaultOnboarding)

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useCreateOnboarding)

        result.current.mutate({
            currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toEqual(false)
        })
    })

    it('should fail when creating the onboarding and notify the user', async () => {
        createOnboardingDataMock.mockRejectedValue({
            message: 'test',
        })

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useCreateOnboarding)

        result.current.mutate({
            currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toEqual(false)
            expect(mockDispatch).toHaveBeenCalledTimes(1)

            expect(notifyActionMock).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message:
                    'An unexpected error occurred while creating onboarding. Please try again.',
                id: 'create-onboarding-error',
            })
        })
    })
})
