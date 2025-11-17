import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { IntegrationType } from 'models/integration/constants'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types/gorgiasChat'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { mockStore } from 'utils/testing'

import SelfServiceChatIntegrationCancelPage from '../SelfServiceChatIntegrationCancelPage'

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
describe('<SelfServiceChatIntegrationCancelPage />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore({})}>
                <SelfServicePreviewContext.Provider
                    value={{
                        reportOrderIssueReason: {
                            reasonKey: 'reasonKey',
                            action: {
                                responseMessageContent: {
                                    html: 'html',
                                    text: 'text',
                                },
                                type: 'automated_response',
                                showHelpfulPrompt: true,
                            },
                        },
                    }}
                >
                    <SelfServiceChatIntegrationCancelPage
                        integration={mockIntegration}
                    />
                </SelfServicePreviewContext.Provider>
            </Provider>,
        )
        expect(
            screen.getByText(/I'd like to cancel the following fulfillment/),
        ).toBeInTheDocument()
    })
})
