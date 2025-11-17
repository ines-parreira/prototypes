import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types/gorgiasChat'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import SelfServiceChatIntegrationHomePage from '../SelfServiceChatIntegrationHomePage'

const queryClient = mockQueryClient()

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
describe('<SelfServiceChatIntegrationHomePage />', () => {
    it('should render component', () => {
        render(
            <Provider store={mockStore({})}>
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
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
                            <SelfServiceChatIntegrationHomePage
                                integration={mockIntegration}
                            />
                        </SelfServicePreviewContext.Provider>
                    </QueryClientProvider>
                </MemoryRouter>
            </Provider>,
        )
        expect(screen.getByText('integration')).toBeInTheDocument()
    })
})
