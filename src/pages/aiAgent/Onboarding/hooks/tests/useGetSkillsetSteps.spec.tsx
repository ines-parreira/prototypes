import { fromJS } from 'immutable'

import {
    AUTOMATION_PRODUCT_ID,
    firstTierMonthlyAutomationPlan,
    products,
} from 'fixtures/productPrices'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'
import { RootState } from 'state/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import { useCreateOnboarding } from '../useCreateOnboarding'
import { useGetSkillsetStep } from '../useGetSkillsetStep'
import { useUpdateOnboarding } from '../useUpdateOnboarding'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')
jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

jest.mock('pages/aiAgent/Onboarding/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

jest.mock('pages/aiAgent/Onboarding/hooks/useCreateOnboarding')
const useCreateOnboardingMock = assumeMock(useCreateOnboarding)
const createOnboardingMock = jest.fn()
const updateOnboardingMock = jest.fn()

useCreateOnboardingMock.mockReturnValue({
    mutate: createOnboardingMock,
} as unknown as ReturnType<typeof useCreateOnboarding>)

useUpdateOnboardingMock.mockReturnValue({
    mutate: (params: {
        id: string
        data: { id: string; scopes: AiAgentScopes[] }
    }) => {
        updateOnboardingMock(params)
        mockUseGetOnboardingData.mockReturnValue({
            data: {
                id: '123',
                scopes: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            },
            isLoading: false,
        })
    },
} as unknown as ReturnType<typeof useUpdateOnboarding>)

const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

const initialState = {
    billing: fromJS({
        products,
    }),
} as RootState

describe('useGetSkillsetStep', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: false,
        })
    })

    it('should return hasSkillsetStep as true when pricing is not usd-6', () => {
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useGetSkillsetStep(),
            initialState,
        )

        expect(result.current.hasSkillsetStep).toBe(true)
    })

    it('should return hasSkillsetStep as false when pricing is usd-6', async () => {
        mockUseGetOnboardingData.mockReturnValue({
            data: { id: '123' },
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useGetSkillsetStep(),
            {
                ...initialState,
                currentAccount: fromJS({
                    current_subscription: {
                        products: {
                            [AUTOMATION_PRODUCT_ID]:
                                firstTierMonthlyAutomationPlan.plan_id,
                        },
                    },
                    domain: 'test.com',
                }),
            },
        )

        expect(result.current.hasSkillsetStep).toBe(false)
    })
})
