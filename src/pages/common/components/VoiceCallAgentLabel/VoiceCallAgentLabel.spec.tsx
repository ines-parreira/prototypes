import {render} from '@testing-library/react'
import React from 'react'

import * as voiceCallHooks from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import VoiceCallAgentLabel from './VoiceCallAgentLabel'

const useAgentDetailsSpy = jest.spyOn(voiceCallHooks, 'useAgentDetails')

describe('<VoiceCallAgentLabel/>', () => {
    it('displays agent label', () => {
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)

        const {getByText} = render(
            <VoiceCallAgentLabel
                agentId={1}
                phoneNumber="1234567890"
                semibold={true}
            />
        )

        expect(getByText('Agent Name')).toBeInTheDocument()
    })

    it('displays agent label with tooltip', () => {
        useAgentDetailsSpy.mockReturnValue({
            data: {name: 'Agent Name'},
        } as any)

        const {getByText} = render(
            <VoiceCallAgentLabel
                agentId={1}
                phoneNumber="1234567890"
                withTooltip={true}
            />
        )

        expect(getByText('Agent Name')).toBeInTheDocument()
    })

    it('displays deleted agent label', () => {
        useAgentDetailsSpy.mockReturnValue({
            error: {response: {status: 404}, isAxiosError: true},
        } as any)

        const {getByText} = render(
            <VoiceCallAgentLabel
                agentId={1}
                phoneNumber="1234567890"
                withTooltip={true}
            />
        )

        expect(getByText('Deleted agent (1234567890)')).toBeInTheDocument()
    })
})
