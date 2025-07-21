import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import history from 'pages/history'

import { PHONE_INTEGRATION_BASE_URL } from '../../constants'
import VoiceIntegrationOnboardingCancelButton from '../VoiceIntegrationOnboardingCancelButton'

jest.mock('pages/history')

describe('VoiceIntegrationOnboardingCancelButton', () => {
    const renderComponent = () =>
        render(<VoiceIntegrationOnboardingCancelButton />)

    it('should render the cancel button', () => {
        renderComponent()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should navigate to phone integration base URL when clicked', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Cancel'))
        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith(
                PHONE_INTEGRATION_BASE_URL,
            )
        })
    })
})
