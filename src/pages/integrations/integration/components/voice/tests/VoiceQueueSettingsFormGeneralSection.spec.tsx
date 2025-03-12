import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceQueueSettingsFormGeneralSection from '../VoiceQueueSettingsFormGeneralSection'

describe('VoiceQueueSettingsFormGeneralSection', () => {
    const renderComponent = () =>
        render(<VoiceQueueSettingsFormGeneralSection />)

    it('should render the general section content', () => {
        renderComponent()

        expect(
            screen.getByText('VoiceQueueSettingsFormGeneralSection'),
        ).toBeInTheDocument()
    })
})
