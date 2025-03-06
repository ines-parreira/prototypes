import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationFallbackSettings from '../HandoverCustomizationFallbackSettings'

describe('HandoverCustomizationFallbackSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly with all UI elements', () => {
        render(<HandoverCustomizationFallbackSettings />)

        // Check the title is rendered
        screen.getByText('Error message')

        // Check the textarea is rendered
        screen.getByRole('textbox', { name: 'Error message' })

        // Check the caption is rendered
        screen.getByText(
            /AI Agent will send the exact text if it encounters an unexpected error handing over/i,
        )

        // Check Save and Cancel buttons are rendered
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })
})
