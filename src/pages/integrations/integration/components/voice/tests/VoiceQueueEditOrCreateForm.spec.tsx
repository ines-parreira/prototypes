import React from 'react'

import { render, screen } from '@testing-library/react'

import { VoiceQueue } from '@gorgias/helpdesk-queries'

import { voiceQueue } from 'fixtures/voiceQueue'

import VoiceQueueEditOrCreateForm from '../VoiceQueueEditOrCreateForm'

jest.mock('../VoiceQueueSettingsFormGeneralSection', () => () => (
    <div>VoiceQueueSettingsFormGeneralSection</div>
))
jest.mock('../VoiceQueueSettingsFormCallFlowSection', () => () => (
    <div>VoiceQueueSettingsFormCallFlowSection</div>
))
jest.mock('../VoiceQueueSettingsLinkedIntegrations', () => () => (
    <div>VoiceQueueSettingsLinkedIntegrations</div>
))

describe('VoiceQueueEditOrCreateForm', () => {
    const renderComponent = (queue?: VoiceQueue) =>
        render(<VoiceQueueEditOrCreateForm queue={queue} />)

    it('should render the general and call flow sections with section headers', () => {
        renderComponent()

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormGeneralSection'),
        ).toBeInTheDocument()

        expect(screen.getByText('Routing options')).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormCallFlowSection'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('VoiceQueueSettingsLinkedIntegrations'),
        ).not.toBeInTheDocument()
    })

    it('should render the linked integrations section with the correct title and description', () => {
        renderComponent({
            ...voiceQueue,
            integrations: [{ id: 1 } as any],
        })

        expect(
            screen.getByText('VoiceQueueSettingsLinkedIntegrations'),
        ).toBeInTheDocument()
    })
})
