import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationOnlineSettings from '../HandoverCustomizationOnlineSettings'

jest.mock('../ChatPreferencesEmailCaptureSettings', () => ({
    __esModule: true,
    default: jest.fn(() => (
        <div data-testid="mock-email-capture-settings">
            mocked email capture settings
        </div>
    )),
}))

jest.mock('../ChatPreferencesAutoReplyWaitTimeSettings', () => ({
    __esModule: true,
    default: jest.fn(() => (
        <div data-testid="mock-auto-reply-settings">
            mocked auto reply settings
        </div>
    )),
}))

describe('HandoverCustomizationOnlineSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders component with all required elements', () => {
        render(<HandoverCustomizationOnlineSettings />)

        // Check for main section headers
        screen.getByText('Online instructions')

        // Check for TextArea
        screen.getByRole('textbox')

        // Check for caption text
        screen.getByText(
            /Write optional instructions for AI Agent to follow during handover/i,
        )

        // Check for alert about chat preferences
        screen.getByText(
            /Changes to the settings below will be reflected in your/i,
        )

        // Check for link to chat preferences
        const chatPreferencesLink = screen.getByRole('link', {
            name: 'Chat preferences.',
        })

        expect(chatPreferencesLink.getAttribute('href')).toBe(
            '/app/settings/channels/gorgias_chat',
        )

        expect(chatPreferencesLink.getAttribute('target')).toBe('_blank')

        // Check for mocked child components
        screen.getByText('mocked email capture settings')
        screen.getByText('mocked auto reply settings')

        // Check for buttons
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })
})
