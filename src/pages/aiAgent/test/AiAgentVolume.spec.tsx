// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import * as contextHook from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getLDClient } from 'utils/launchDarkly'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentVolume } from '../AiAgentVolume'
import { SALES } from '../constants'

const queryClient = mockQueryClient()

jest.mock('pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    contextHook.useAiAgentStoreConfigurationContext,
)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <AiAgentVolume />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentVolume />', () => {
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

    it('should render the volume settings', () => {
        renderComponent()
        expect(
            screen.getByRole('heading', { level: 1, name: SALES }),
        ).toBeInTheDocument()
    })
})
