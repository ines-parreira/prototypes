import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { keyBy } from '@gorgias/toolkit'
import { billingState } from 'fixtures/billing'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import {
    applicationAutomationSettingsFixture,
    applicationsAutomationSettingsStateFixture,
} from 'pages/aiAgent/fixtures/applicationAutomationSettings.fixture'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useApplicationsAutomationSettings } from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { useSelfServiceChannels } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { useSelfServiceChatChannels } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import type { RootState } from 'state/types'

import { initialState as articlesState } from '../../../../../state/entities/helpCenter/articles'
import { initialState as categoriesState } from '../../../../../state/entities/helpCenter/categories'
import { ConnectedChannelsChatView } from '../components/ConnectedChannelsChatView'

jest.mock('settings/automate/hooks/useIsAutomateSettings')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
    () => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ...jest.requireActual(
            'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
        ),
        useChatPreviewChannelsContext: jest.fn().mockReturnValue({
            shopName: 'mystore',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        }),
    }),
)
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopify',
        shopName: 'mystore',
    })),
    useRouteMatch: jest.fn(() => ({
        path: '/app/automation/shopType/shopName/connected-channels',
        url: '/app/automation/shopType/shopName/connected-channels',
    })),
}))
const mockHelpCenterFixture = getSingleHelpCenterResponseFixture
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetHelpCenter: jest.fn(() => ({
        data: mockHelpCenterFixture,
        isLoading: false,
    })),
}))
const useGetHelpCenterMock = useGetHelpCenter as jest.Mock
const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS(billingState),
} as RootState
const contactForm = ContactFormFixture
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceChannels')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock('models/workflows/queries', () => ({
    ...jest.requireActual('models/workflows/queries'),
    useGetWorkflowConfigurations: jest.fn(() => ({ data: [] })),
}))
describe('ConnectedChannelsView', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChatChannels)
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue(
            mockChatChannels,
        )
        ;(useShouldShowChatSettingsRevamp as jest.Mock).mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: false,
            shouldShowChatSettingsRevamp: false,
            isLoading: false,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: true,
                        entrypoints: [
                            {
                                enabled: true,
                                workflow_id: '01HZHAN2Z7WBMAPK266DTW0ZWC',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HNDKMSSAV6MPV125PXB3MMSG',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HQQYPGNH1CNBART86FG8PCN6',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HQT87MV168MHHENMC1VC55S7',
                            },
                        ],
                    },
                    createdDatetime: '2024-06-05T11:27:06.939Z',
                    updatedDatetime: '2024-07-30T14:16:39.411Z',
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        ;(
            useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
        ).mockReturnValue({ enabledInSettings: true })
    })
    it('should render', () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
    })
    it('should render the dropdown', () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
    })
    it('should render chat icon in the dropdown', () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByText('chat_bubble')).toBeInTheDocument()
    })
    it('should show the current channel name', () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(
            // button with aria-label="Currently viewing"
            screen.getByRole('button', { name: 'Currently viewing' }),
        ).toHaveTextContent(mockChatChannels[0].value.name)
    })
    it('should render the dropdown options', async () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        // click on the dropdown button
        await userEvent.click(
            screen.getByRole('button', { name: 'Currently viewing' }),
        )
        // expect the dropdown to be visible
        expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        // expect the dropdown to have the same number of options as the channels
        expect(screen.getAllByRole('option').length).toBe(
            mockChatChannels.length,
        )
        screen.getAllByRole('option').forEach((option, index) => {
            expect(option).toHaveTextContent(mockChatChannels[index].value.name)
        })
    })
    it('should render the loading spinner', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: true,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
    it('should render the loading spinner if the automation settings does not have the current channel', () => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
    it('toggles the settings', async () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationsAutomationSettingsStateFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        await act(async () => {
            fireEvent.click(screen.getByLabelText(/Enable Order Management/i))
            await waitFor(() => {
                expect(handleUpdate).toHaveBeenCalledTimes(1)
            })
        })
    })
    it('calls sets the selected value whenever a new channel is selected', () => {
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        const dropdown = screen.getByRole('button', {
            name: 'Currently viewing',
        })
        fireEvent.click(dropdown)
        fireEvent(
            screen.getByText(mockChatChannels[1].value.name),
            new MouseEvent('click', { bubbles: true }),
        )
    })
    it('will not render the preview chat if selfServiceConfiguration is not defined', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.queryByText(/Test/i)).not.toBeInTheDocument()
    })
    it(`will call 'handleUpdate' when switching on the article recommendation`, () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: {
                        enabled: false,
                    },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        ;(useGetHelpCenter as jest.Mock).mockReturnValue({
            data: {
                ...mockHelpCenterFixture,
            },
            isLoading: false,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        const toggle = screen.getByLabelText(/Enable Article Recommendation/i)
        fireEvent.click(toggle)
        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendation: { enabled: true },
            }),
            'Article Recommendation enabled',
        )
    })
    it('should show Article Recommendation toggle as unchecked when articleRecommendation.enabled is false in settings', () => {
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: { enabled: false },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(
            screen.getByRole('switch', {
                name: /enable article recommendation/i,
            }),
        ).not.toBeChecked()
    })
    it(`will call 'handleUpdate' when switching on the order management`, () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings:
                applicationsAutomationSettingsStateFixture,
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)
        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: true },
            }),
            'Order Management enabled',
        )
    })
    it('should call `handleUpdate` when switching off the order management', () => {
        const handleUpdate = jest.fn()
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: {
                type: 'shopify',
                meta: { shop_domain: 'test.myshopify.com', shop_name: 'test' },
            },
            isFetchPending: false,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: true,
                    },
                    workflows: {
                        enabled: true,
                        entrypoints: [
                            {
                                enabled: true,
                                workflow_id: '01HZHAN2Z7WBMAPK266DTW0ZWC',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HNDKMSSAV6MPV125PXB3MMSG',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HQQYPGNH1CNBART86FG8PCN6',
                            },
                            {
                                enabled: true,
                                workflow_id: '01HQT87MV168MHHENMC1VC55S7',
                            },
                        ],
                    },
                    createdDatetime: '2024-06-05T11:27:06.939Z',
                    updatedDatetime: '2024-07-30T14:16:39.411Z',
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        const toggle = screen.getByLabelText(/Enable Order Management/i)
        fireEvent.click(toggle)
        expect(handleUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: false },
            }),
            'Order Management disabled',
        )
    })
    it('should take `shopType` and `shopName` from props when passed', () => {
        const handleUpdate = jest.fn()
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    ...applicationAutomationSettingsFixture,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                },
                23: {
                    ...applicationAutomationSettingsFixture,
                    id: 23,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: handleUpdate,
        })
        render(
            <ConnectedChannelsChatView
                channelId={16}
                shopType="shopitay"
                shopName="itayshop"
                hideDropdown
            />,
            {
                storeState: {
                    ...defaultState,
                    entities: {
                        contactForm: {
                            contactFormsAutomationSettings: {
                                automationSettingsByContactFormId: {
                                    [contactForm.id]: {
                                        workflows: [],
                                        order_management: { enabled: false },
                                    },
                                },
                            },
                            contactForms: {
                                contactFormById: keyBy([contactForm], 'id'),
                            },
                        },
                        chatsApplicationAutomationSettings: {
                            25: {
                                id: 110,
                                applicationId: 20,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            24: {
                                id: 110,
                                applicationId: 24,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            23: {
                                id: 110,
                                applicationId: 23,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                        },
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    '1': getSingleHelpCenterResponseFixture,
                                },
                            },
                            helpCentersAutomationSettings: {},
                            articles: articlesState,
                            categories: categoriesState,
                        },
                    },
                },
            },
        )
        expect(screen.queryByText(/currently viewing/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/chat_bubble/i)).not.toBeInTheDocument()
        // Article recommendation toggle is shown but should be checked (enabled)
        expect(
            screen.getByRole('switch', {
                name: /enable article recommendation/i,
            }),
        ).toBeChecked()
        expect(
            screen.getByRole('switch', { name: /enable order management/i }),
        ).not.toBeChecked()
    })
    it('should render the empty state when there are no channels', () => {
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue([])
        ;(useSelfServiceChatChannels as jest.Mock).mockReturnValue([])
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: [],
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByText(/Go to Chat/i)).toBeInTheDocument()
    })
    it('should render "Configuration Required" warning when the help center is not configured', () => {
        useGetHelpCenterMock.mockReturnValue({
            data: {
                ...mockHelpCenterFixture,
                deleted_datetime: '2024-07-12T12:44:21.004402+00:00',
            },
            isLoading: false,
        })
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByText(/Configuration Required/i)).toBeInTheDocument()
    })
    it('should show loading spinner when data is being fetched', () => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        ;(useSelfServiceChannels as jest.Mock).mockReturnValue(mockChatChannels)
        render(<ConnectedChannelsChatView />, {
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
    it('should handle channel selection change and navigation', async () => {
        // Mock useIsAutomateSettings to return true
        ;(useIsAutomateSettings as jest.Mock).mockReturnValue(true)
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
        ;(useApplicationsAutomationSettings as jest.Mock).mockReturnValue({
            applicationsAutomationSettings: {
                25: {
                    id: 110,
                    applicationId: 20,
                    articleRecommendation: {
                        enabled: true,
                    },
                    orderManagement: {
                        enabled: false,
                    },
                    workflows: {
                        enabled: true,
                        entrypoints: [
                            {
                                enabled: true,
                                workflow_id: '01HQTDDBN1A75R9TH8PCQS4ARA',
                            },
                        ],
                    },
                    createdDatetime: '2024-06-05T11:27:06.939Z',
                    updatedDatetime: '2024-07-30T14:16:39.411Z',
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })
        render(<ConnectedChannelsChatView />, {
            path: '/:shopType/:shopName/channels',
            initialEntries: ['/shopify/itay-store-two/channels'],
            storeState: {
                ...defaultState,
                entities: {
                    contactForm: {
                        contactFormsAutomationSettings: {
                            automationSettingsByContactFormId: {
                                [contactForm.id]: {
                                    workflows: [],
                                    order_management: { enabled: false },
                                },
                            },
                        },
                        contactForms: {
                            contactFormById: keyBy([contactForm], 'id'),
                        },
                    },
                    chatsApplicationAutomationSettings: {
                        25: {
                            id: 110,
                            applicationId: 20,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        24: {
                            id: 110,
                            applicationId: 24,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                        23: {
                            id: 110,
                            applicationId: 23,
                            articleRecommendation: {
                                enabled: false,
                            },
                            orderManagement: {
                                enabled: false,
                            },
                            workflows: {
                                enabled: true,
                                entrypoints: [
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HNDKMSSAV6MPV125PXB3MMSG',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQQYPGNH1CNBART86FG8PCN6',
                                    },
                                    {
                                        enabled: true,
                                        workflow_id:
                                            '01HQT87MV168MHHENMC1VC55S7',
                                    },
                                ],
                            },
                            createdDatetime: '2024-06-05T11:27:06.939Z',
                            updatedDatetime: '2024-07-30T14:16:39.411Z',
                        },
                    },
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '1': getSingleHelpCenterResponseFixture,
                            },
                        },
                        helpCentersAutomationSettings: {},
                        articles: articlesState,
                        categories: categoriesState,
                    },
                },
            },
        })
        // Wait for dropdown to be visible and verify initial state
        await waitFor(() => {
            expect(screen.getByText('Currently viewing')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: 'Currently viewing' }),
        ).toHaveTextContent(mockChatChannels[0].value.name)
        // Open dropdown
        const dropdown = screen.getByRole('button', {
            name: 'Currently viewing',
        })
        await act(async () => {
            fireEvent.click(dropdown)
        })
        // The dropdown only shows chat channels; click the second one
        await waitFor(() => {
            expect(
                screen.getByText(mockChatChannels[1].value.name),
            ).toBeInTheDocument()
        })
        await act(async () => {
            fireEvent.click(screen.getByText(mockChatChannels[1].value.name))
        })
    })
    describe('Article recommendation visibility for Shopify integrations', () => {
        it('should hide Article Recommendation section when storeIntegration is Shopify and enabledInSettings is false', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'shopify',
                    meta: {
                        shop_domain: 'test-store.myshopify.com',
                        shop_name: 'test-store',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: false })
            render(<ConnectedChannelsChatView />, {
                storeState: {
                    ...defaultState,
                    entities: {
                        contactForm: {
                            contactFormsAutomationSettings: {
                                automationSettingsByContactFormId: {
                                    [contactForm.id]: {
                                        workflows: [],
                                        order_management: { enabled: false },
                                    },
                                },
                            },
                            contactForms: {
                                contactFormById: keyBy([contactForm], 'id'),
                            },
                        },
                        chatsApplicationAutomationSettings: {
                            25: {
                                id: 110,
                                applicationId: 20,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            24: {
                                id: 110,
                                applicationId: 24,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            23: {
                                id: 110,
                                applicationId: 23,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                        },
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    '1': getSingleHelpCenterResponseFixture,
                                },
                            },
                            helpCentersAutomationSettings: {},
                            articles: articlesState,
                            categories: categoriesState,
                        },
                    },
                },
            })
            expect(
                screen.queryByText(/Article Recommendation/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText(/Enable Article Recommendation/i),
            ).not.toBeInTheDocument()
        })
        it('should show Article Recommendation section when storeIntegration is Shopify and enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'shopify',
                    meta: {
                        shop_domain: 'test-store.myshopify.com',
                        shop_name: 'test-store',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })
            render(<ConnectedChannelsChatView />, {
                storeState: {
                    ...defaultState,
                    entities: {
                        contactForm: {
                            contactFormsAutomationSettings: {
                                automationSettingsByContactFormId: {
                                    [contactForm.id]: {
                                        workflows: [],
                                        order_management: { enabled: false },
                                    },
                                },
                            },
                            contactForms: {
                                contactFormById: keyBy([contactForm], 'id'),
                            },
                        },
                        chatsApplicationAutomationSettings: {
                            25: {
                                id: 110,
                                applicationId: 20,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            24: {
                                id: 110,
                                applicationId: 24,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            23: {
                                id: 110,
                                applicationId: 23,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                        },
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    '1': getSingleHelpCenterResponseFixture,
                                },
                            },
                            helpCentersAutomationSettings: {},
                            articles: articlesState,
                            categories: categoriesState,
                        },
                    },
                },
            })
            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })
        it('should show Article Recommendation section when storeIntegration is non-Shopify (BigCommerce) when enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'bigcommerce',
                    meta: {
                        shop_domain: 'test-store.mybigcommerce.com',
                        store_hash: 'abc123',
                    },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })
            render(<ConnectedChannelsChatView />, {
                storeState: {
                    ...defaultState,
                    entities: {
                        contactForm: {
                            contactFormsAutomationSettings: {
                                automationSettingsByContactFormId: {
                                    [contactForm.id]: {
                                        workflows: [],
                                        order_management: { enabled: false },
                                    },
                                },
                            },
                            contactForms: {
                                contactFormById: keyBy([contactForm], 'id'),
                            },
                        },
                        chatsApplicationAutomationSettings: {
                            25: {
                                id: 110,
                                applicationId: 20,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            24: {
                                id: 110,
                                applicationId: 24,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            23: {
                                id: 110,
                                applicationId: 23,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                        },
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    '1': getSingleHelpCenterResponseFixture,
                                },
                            },
                            helpCentersAutomationSettings: {},
                            articles: articlesState,
                            categories: categoriesState,
                        },
                    },
                },
            })
            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })
        it('should show Article Recommendation section when storeIntegration is non-Shopify (Magento2) when enabledInSettings is true', () => {
            ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
                selfServiceConfiguration: mockSelfServiceConfiguration,
                storeIntegration: {
                    type: 'magento2',
                    meta: { store_url: 'https://test-store.com' },
                },
                isFetchPending: false,
            })
            ;(
                useIsArticleRecommendationsEnabledWhileSunset as jest.Mock
            ).mockReturnValue({ enabledInSettings: true })
            render(<ConnectedChannelsChatView />, {
                storeState: {
                    ...defaultState,
                    entities: {
                        contactForm: {
                            contactFormsAutomationSettings: {
                                automationSettingsByContactFormId: {
                                    [contactForm.id]: {
                                        workflows: [],
                                        order_management: { enabled: false },
                                    },
                                },
                            },
                            contactForms: {
                                contactFormById: keyBy([contactForm], 'id'),
                            },
                        },
                        chatsApplicationAutomationSettings: {
                            25: {
                                id: 110,
                                applicationId: 20,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            24: {
                                id: 110,
                                applicationId: 24,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                            23: {
                                id: 110,
                                applicationId: 23,
                                articleRecommendation: {
                                    enabled: false,
                                },
                                orderManagement: {
                                    enabled: false,
                                },
                                workflows: {
                                    enabled: true,
                                    entrypoints: [
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHAN2Z7WBMAPK266DTW0ZWC',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HZHASJ8ZN2TEVG0TSTVYXAQX',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HNDKMSSAV6MPV125PXB3MMSG',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQQYPGNH1CNBART86FG8PCN6',
                                        },
                                        {
                                            enabled: true,
                                            workflow_id:
                                                '01HQT87MV168MHHENMC1VC55S7',
                                        },
                                    ],
                                },
                                createdDatetime: '2024-06-05T11:27:06.939Z',
                                updatedDatetime: '2024-07-30T14:16:39.411Z',
                            },
                        },
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    '1': getSingleHelpCenterResponseFixture,
                                },
                            },
                            helpCentersAutomationSettings: {},
                            articles: articlesState,
                            categories: categoriesState,
                        },
                    },
                },
            })
            expect(
                screen.getByRole('switch', {
                    name: /Enable Article Recommendation/i,
                }),
            ).toBeInTheDocument()
        })
    })
})
