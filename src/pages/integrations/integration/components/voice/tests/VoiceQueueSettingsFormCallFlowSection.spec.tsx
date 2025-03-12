import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceQueueSettingsFormCallFlowSection from '../VoiceQueueSettingsFormCallFlowSection'

describe('VoiceQueueSettingsFormCallFlowSection', () => {
    const renderComponent = () =>
        render(<VoiceQueueSettingsFormCallFlowSection />)

    it('should render the call flow section content', () => {
        renderComponent()

        expect(
            screen.getByText('VoiceQueueSettingsFormCallFlowSection'),
        ).toBeInTheDocument()
    })
})
