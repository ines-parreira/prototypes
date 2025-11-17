import { render, screen } from '@testing-library/react'

import type { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { FlowProvider } from 'core/ui/flows'
import * as flows from 'core/ui/flows'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlow } from '../VoiceFlow'

const useAutoLayoutSpy = jest.spyOn(flows, 'useAutoLayout')
const FlowSpy = jest.spyOn(flows, 'Flow')

// mock play message node to avoid dealing with form context
jest.mock('../nodes/PlayMessageNode', () => ({
    PlayMessageNode: () => <div>PlayMessageNode</div>,
}))

describe('VoiceFlow', () => {
    const mockFlow = {
        first_step_id: 'play_message',
        steps: {
            play_message: {
                id: 'play_message',
                step_type: VoiceFlowNodeType.PlayMessage,
                next_step_id: null,
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Hello, this is a test message.',
                },
            },
        },
    } as CallRoutingFlow

    it('should render incoming & end call nodes', () => {
        render(
            <FlowProvider>
                <VoiceFlow flow={mockFlow} />
            </FlowProvider>,
        )

        expect(screen.getByText('Incoming Call')).toBeInTheDocument()
        expect(screen.getByText('End Call')).toBeInTheDocument()

        expect(useAutoLayoutSpy).toHaveBeenCalled()
    })

    it('should render flow with interactive elements when preview is false', () => {
        render(
            <FlowProvider>
                <VoiceFlow flow={mockFlow} preview={false} />
            </FlowProvider>,
        )

        expect(FlowSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                elementsSelectable: true,
            }),
            expect.anything(),
        )
    })

    it('should render flow with non-interactive elements when preview is true', () => {
        render(
            <FlowProvider>
                <VoiceFlow flow={mockFlow} preview={true} />
            </FlowProvider>,
        )

        expect(FlowSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                elementsSelectable: false,
            }),
            expect.anything(),
        )
    })
})
