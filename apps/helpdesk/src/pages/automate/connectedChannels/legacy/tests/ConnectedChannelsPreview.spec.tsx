import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { applicationAutomationSettingsFixture } from 'pages/aiAgent/fixtures/applicationAutomationSettings.fixture'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'

jest.mock(
    'pages/automate/common/components/preview/SelfServicePreview',
    () => ({
        __esModule: true,
        default: () => <div>SelfServicePreview</div>,
    }),
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const baseState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    integrations: fromJS({ integrations: [] }),
} as RootState

const renderPreview = (automationSettings: Record<string, unknown>) => {
    const store = mockStore({
        ...baseState,
        entities: {
            chatsApplicationAutomationSettings: automationSettings,
            contactForm: {
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {},
                },
                contactForms: { contactFormById: {} },
            },
            helpCenter: {
                helpCentersAutomationSettings: {},
            },
        },
    } as unknown as RootState)

    return render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ConnectedChannelsPreview
                        channel={mockChatChannels[0]}
                        selfServiceConfiguration={mockSelfServiceConfiguration}
                    />
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

describe('<ConnectedChannelsPreview />', () => {
    it('renders without crashing when automation settings for the app are missing', () => {
        expect(() => renderPreview({})).not.toThrow()
    })

    it('renders when automation settings for the app are present', () => {
        const appId = mockChatChannels[0].value.meta.app_id as string

        expect(() =>
            renderPreview({
                [appId]: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: true },
                },
            }),
        ).not.toThrow()
    })
})
