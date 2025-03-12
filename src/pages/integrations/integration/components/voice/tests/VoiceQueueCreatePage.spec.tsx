import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceQueueCreatePage from '../VoiceQueueCreatePage'

jest.mock('../VoiceQueueSettingsFormGeneralSection', () => () => (
    <div>VoiceQueueSettingsFormGeneralSection</div>
))
jest.mock('../VoiceQueueSettingsFormCallFlowSection', () => () => (
    <div>VoiceQueueSettingsFormCallFlowSection</div>
))

describe('VoiceQueueCreatePage', () => {
    const renderComponent = () => render(<VoiceQueueCreatePage />)

    it('should render the general and call flow section and form buttons', () => {
        renderComponent()

        expect(
            screen.getByText('VoiceQueueSettingsFormGeneralSection'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormCallFlowSection'),
        ).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
})
