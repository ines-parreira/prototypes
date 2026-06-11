import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import { SELF_SERVICE_PREVIEW_ROUTES } from '../constants'
import { DefaultExportSelfServiceChatIntegrationPreview as SelfServiceChatIntegrationPreview } from '../SelfServiceChatIntegrationPreview'
import { useSelfServicePreviewContext } from '../SelfServicePreviewContext'

jest.mock('../SelfServicePreviewContext', () => ({
    useSelfServicePreviewContext: jest.fn(),
}))

const mockIntegration = {
    name: 'Test Integration',
    decoration: {
        avatar: {
            company_logo_url: 'https://example.com/logo.png',
            image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
            name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        },
        introduction_text: 'Welcome to our chat!',
        main_color: '#ff0000',
        main_font_family: 'Arial',
        header_picture_url: 'https://example.com/header.png',
        display_bot_label: true,
        use_main_color_outside_business_hours: true,
    },
    meta: {
        preferences: {
            auto_responder: {
                enabled: true,
                reply: 'Thank you for reaching out!',
            },
        },
    },
} as any
describe('SelfServiceChatIntegrationPreview', () => {
    beforeEach(() => {
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            reportOrderIssueReason: { action: { showHelpfulPrompt: true } },
        })
    })

    it('renders correctly with default props', () => {
        render(
            <SelfServiceChatIntegrationPreview integration={mockIntegration} />,
        )
        expect(screen.getByText('Welcome to our chat!')).toBeInTheDocument()
    })

    it('renders the correct page based on route', () => {
        render(
            <SelfServiceChatIntegrationPreview integration={mockIntegration} />,
            {
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.ORDERS],
                path: SELF_SERVICE_PREVIEW_ROUTES.ORDERS,
            },
        )

        expect(screen.getByText('Your orders')).toBeInTheDocument()
    })

    it('renders the footer correctly based on path', () => {
        render(
            <SelfServiceChatIntegrationPreview integration={mockIntegration} />,
            {
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.CANCEL],
            },
        )

        expect(
            screen.getByText(`I'd like to cancel the following fulfillment:`),
        ).toBeInTheDocument()
    })

    it('updates correctly on prop changes', () => {
        const { rerender } = render(
            <SelfServiceChatIntegrationPreview integration={mockIntegration} />,
        )

        const updatedIntegration = {
            ...mockIntegration,
            name: 'Updated Integration',
            decoration: {
                introduction_text: 'Updated introduction text',
            },
        }

        rerender(
            <SelfServiceChatIntegrationPreview
                integration={updatedIntegration}
            />,
        )

        expect(
            screen.getByText('Updated introduction text'),
        ).toBeInTheDocument()
    })
})
