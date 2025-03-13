import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceQueueEditOrCreateForm from '../VoiceQueueEditOrCreateForm'

jest.mock('../VoiceQueueSettingsFormGeneralSection', () => () => (
    <div>VoiceQueueSettingsFormGeneralSection</div>
))
jest.mock('../VoiceQueueSettingsFormCallFlowSection', () => () => (
    <div>VoiceQueueSettingsFormCallFlowSection</div>
))

describe('VoiceQueueEditOrCreateForm', () => {
    const renderComponent = () => render(<VoiceQueueEditOrCreateForm />)

    it('should render the general and call flow sections with section headers', () => {
        renderComponent()

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormGeneralSection'),
        ).toBeInTheDocument()

        expect(screen.getByText('Call flow')).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormCallFlowSection'),
        ).toBeInTheDocument()
    })
})
