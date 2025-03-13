import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceQueueCreatePage from '../VoiceQueueCreatePage'

jest.mock('../VoiceQueueSettingsFormGeneralSection', () => () => (
    <div>VoiceQueueSettingsFormGeneralSection</div>
))
jest.mock('../VoiceQueueEditOrCreateForm', () => () => (
    <div>VoiceQueueEditOrCreateForm</div>
))

describe('VoiceQueueCreatePage', () => {
    const renderComponent = () => render(<VoiceQueueCreatePage />)

    it('should render the edit or create queue form and form buttons', () => {
        renderComponent()

        expect(
            screen.getByText('VoiceQueueEditOrCreateForm'),
        ).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
})
