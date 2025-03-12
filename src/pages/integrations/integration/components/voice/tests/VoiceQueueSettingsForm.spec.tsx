import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import VoiceQueueSettingsForm from '../VoiceQueueSettingsForm'

describe('VoiceQueueSettingsForm', () => {
    const onSubmitMock = jest.fn()
    const renderComponent = () =>
        render(
            <VoiceQueueSettingsForm onSubmit={onSubmitMock}>
                <div>Form Content</div>
                <button type="submit">Submit</button>
            </VoiceQueueSettingsForm>,
        )

    it('should render the form content', () => {
        renderComponent()

        expect(screen.getByText('Form Content')).toBeInTheDocument()
    })

    it('should call onSubmit when the form is submitted', async () => {
        renderComponent()

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => expect(onSubmitMock).toHaveBeenCalled())
    })
})
