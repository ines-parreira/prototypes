import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationOfflineSettings from '../HandoverCustomizationOfflineSettings'

describe('HandoverCustomizationOfflineSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly with all UI elements', () => {
        render(<HandoverCustomizationOfflineSettings />)

        screen.getByText('Offline instructions')
        // text area
        screen.getByRole('textbox')

        screen.getByText(
            /Write optional instructions for AI Agent to follow during handover./i,
        )

        // Check the toggle is rendered
        screen.getByRole('checkbox', {
            name: /Share business hours in handover message/i,
        })

        // explanation text
        screen.getByText('Share business hours in handover message')

        // link
        screen.getByText('View Business Hours')

        // Check business hours link
        const link = screen.getByText('View Business Hours')

        expect(link).toHaveAttribute('href', '/app/settings/business-hours')
        expect(link).toHaveAttribute('target', '_blank')

        // Check buttons are rendered
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })
})
