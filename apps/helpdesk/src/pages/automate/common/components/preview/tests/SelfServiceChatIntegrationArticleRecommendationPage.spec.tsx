import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types/gorgiasChat'

import SelfServiceChatIntegrationArticleRecommendationPage from '../SelfServiceChatIntegrationArticleRecommendationPage'

const mockIntegration: GorgiasChatIntegration = {
    name: 'integration',
    id: 1,
    managed: false,
    type: IntegrationType.GorgiasChat,
    meta: {
        self_service: {},
    },
    description: 'description',
    created_datetime: '2021-09-01T00:00:00Z',
    deactivated_datetime: null,
    deleted_datetime: null,
    locked_datetime: null,
    uri: 'https://example.com',
    user: {
        id: 1,
    },
    updated_datetime: '2021-09-01T00:00:00Z',
    decoration: {
        position: {
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
            offsetX: 0,
            offsetY: 0,
        },
        avatar: {
            company_logo_url: 'https://example.com/logo.png',
            image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
            name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        },
        avatar_team_picture_url: 'https://example.com/team.png',
        avatar_type: 'agent',
        conversation_color: '#ff0000',
        offline_introduction_text: 'We are offline',
        introduction_text: 'Welcome to our chat!',
        main_color: '#ff0000',
        main_font_family: 'Arial',
        header_picture_url: 'https://example.com/header.png',
        display_bot_label: true,
        use_main_color_outside_business_hours: true,
    },
}

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    agents: fromJS({
        all: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: { name: 'admin' },
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: { name: 'agent' },
            },
        ],
    }),
}

describe('<SelfServiceChatIntegrationArticleRecommendationPage />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore(mockStoreState)}>
                <SelfServiceChatIntegrationArticleRecommendationPage
                    integration={mockIntegration}
                />
            </Provider>,
        )
        expect(
            screen.getByText('What size should I order?'),
        ).toBeInTheDocument()
    })
})
