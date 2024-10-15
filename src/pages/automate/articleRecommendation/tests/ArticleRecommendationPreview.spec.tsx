import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {screen, render} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {
    GorgiasChatIntegration,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'
import {IntegrationType} from 'models/integration/constants'
import ArticleRecommendationPreview from '../ArticleRecommendationPreview'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const gorgiasChatIntegration: GorgiasChatIntegration = {
    type: IntegrationType.GorgiasChat,
    name: '',
    uri: '',
    updated_datetime: '',
    user: {
        id: 1,
    },
    created_datetime: '',
    deactivated_datetime: null,
    deleted_datetime: null,
    description: '',
    id: 1,
    locked_datetime: null,
    managed: false,
    meta: {
        self_service: {
            enabled: true,
        },
    },
    decoration: {
        avatar_team_picture_url: '',
        avatar_type: 'team',
        conversation_color: '',
        introduction_text: '',
        main_color: '',
        main_font_family: '',
        offline_introduction_text: '',
        position: {
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
            offsetX: 0,
            offsetY: 0,
        },
    },
}

const mockSelfServiceConfigurations: SelfServiceConfiguration = {
    id: 1,
    type: IntegrationType.Shopify,
    shopName: 'test-shop',
    createdDatetime: '2023-11-15 19:00:00.000000',
    updatedDatetime: '2023-11-15 19:00:00.000000',
    deactivatedDatetime: null,
    reportIssuePolicy: {
        enabled: true,
        cases: [],
    },
    trackOrderPolicy: {
        enabled: true,
        unfulfilledMessage: {
            text: '',
            html: '',
        },
    },
    cancelOrderPolicy: {
        enabled: true,
        eligibilities: [],
        exceptions: [],
    },
    returnOrderPolicy: {
        enabled: true,
        eligibilities: [],
        exceptions: [],
    },
    articleRecommendationHelpCenterId: null,
}

const defaultState = {
    entities: {
        chatsApplicationAutomationSettings: {},
    },
} as RootState

describe('<ArticleRecommendationPreview />', () => {
    beforeEach(() => {})
    it('should render component', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ArticleRecommendationPreview
                        channels={[
                            {
                                type: TicketChannel.Chat,
                                value: gorgiasChatIntegration,
                            },
                        ]}
                        isHelpCenterSelected
                        selfServiceConfiguration={mockSelfServiceConfigurations}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(
            screen.getByText('What size should I order?')
        ).toBeInTheDocument()
    })
})
