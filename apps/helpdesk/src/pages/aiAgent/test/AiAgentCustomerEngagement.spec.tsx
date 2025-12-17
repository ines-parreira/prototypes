// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { getLDClient } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import * as contextHook from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentCustomerEngagement } from '../AiAgentCustomerEngagement'
import { SALES } from '../constants'

const queryClient = mockQueryClient()

jest.mock('pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock(
    'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner',
    () => () => <div>AI-Shopping-Assistant-Expire-Banner</div>,
)
jest.mock('state/integrations/actions', () => {
    return {
        getTranslations: jest.fn().mockResolvedValue({}),
        getApplicationTexts: jest.fn().mockResolvedValue({}),
        updateApplicationTexts: jest.fn().mockResolvedValue({}),
    }
})
jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/useTexts',
    () => ({
        useTexts: () => ({
            texts: {
                'en-US': {
                    texts: {},
                    sspTexts: {},
                    meta: {},
                },
            },
            translations: {
                texts: {},
                sspTexts: {},
                meta: {},
            },
            isLoading: false,
            error: null,
        }),
    }),
)

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    contextHook.useAiAgentStoreConfigurationContext,
)

const defaultState = {
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentCustomerEngagement />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentCustomerEngagement />', () => {
    beforeEach(() => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...getStoreConfigurationFixture(),
                storeName: 'Test Store',
                monitoredChatIntegrations: [1],
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        mockUseGetChatIntegrationColor.mockReturnValue({
            conversationColor: '#000000',
            mainColor: '#000000',
        })

        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('should render the customer engagement settings', () => {
        renderComponent()
        expect(
            screen.getByRole('heading', { level: 1, name: SALES }),
        ).toBeInTheDocument()
    })
})
