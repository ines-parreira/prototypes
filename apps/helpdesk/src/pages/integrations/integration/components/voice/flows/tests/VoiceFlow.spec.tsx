import { render, screen } from '@testing-library/react'

import { mockCallRoutingFlow } from '@gorgias/helpdesk-mocks'

import { FlowProvider } from 'core/ui/flows'
import * as flows from 'core/ui/flows'

import { VoiceFlow } from '../VoiceFlow'

const useAutoLayoutSpy = jest.spyOn(flows, 'useAutoLayout')

const mockFlow = mockCallRoutingFlow()

describe('VoiceFlow', () => {
    it('should render incoming & end call nodes', () => {
        render(
            <FlowProvider>
                <VoiceFlow flow={mockFlow} />
            </FlowProvider>,
        )

        expect(screen.getByText('Incoming Call')).toBeInTheDocument()
        expect(screen.getByText('End Call')).toBeInTheDocument()

        /* should use the auto layout hook */
        expect(useAutoLayoutSpy).toHaveBeenCalled()
    })
})
