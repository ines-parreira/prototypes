import {cleanup, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {AgentLabel} from 'pages/common/utils/labels'
import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'
import VoiceCallAgentLabel from '../VoiceCallAgentLabel/VoiceCallAgentLabel'

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: (props: ComponentProps<typeof AgentLabel>) => (
        <p>AgentLabel {props.name}</p>
    ),
}))

const useAgentDetailsSpy = jest.spyOn(voiceCallHooks, 'useAgentDetails')

describe('VoiceCallAgentLabel', () => {
    const renderComponent = (
        props: ComponentProps<typeof VoiceCallAgentLabel>
    ) => render(<VoiceCallAgentLabel {...props} />)

    afterEach(() => {
        cleanup()
    })

    it('should render phone number when agent name does not exist', () => {
        useAgentDetailsSpy.mockReturnValue({
            agent: undefined,
        } as any)
        renderComponent({agentId: 1, phoneNumber: '1234567890'})

        expect(screen.getByText('AgentLabel 1234567890')).toBeInTheDocument()
    })

    it('should render agent name when agent name exists', () => {
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)
        renderComponent({agentId: 1, phoneNumber: '1234567890'})

        expect(screen.getByText('AgentLabel Agent Name')).toBeInTheDocument()
    })

    it('should render deleted agent when agent does not exist', () => {
        useAgentDetailsSpy.mockReturnValue({
            error: {response: {status: 404}, isAxiosError: true},
        } as any)
        renderComponent({agentId: 1, phoneNumber: '1234567890'})

        expect(
            screen.getByText('AgentLabel Deleted agent (1234567890)')
        ).toBeInTheDocument()
    })
})
