import { render, screen } from '@testing-library/react'

import { FlowProvider } from 'core/ui/flows'
import { Flow } from 'core/ui/flows/components/Flow'

import { VoiceFlowNodeType } from '../../constants'
import { EnqueueOptionNode } from '../EnqueueOptionNode'

const renderComponent = () => {
    return render(
        <FlowProvider>
            <Flow
                nodes={[
                    {
                        id: '1',
                        type: VoiceFlowNodeType.EnqueueOption,
                        position: { x: 0, y: 0 },
                        data: {
                            parentId: '1',
                            isSkipStep: true,
                            next_step_id: null,
                        },
                    },
                    {
                        id: '2',
                        type: VoiceFlowNodeType.EnqueueOption,
                        position: { x: 0, y: 0 },
                        data: {
                            parentId: '1',
                            isSkipStep: false,
                            next_step_id: null,
                        },
                    },
                ]}
                nodeTypes={{
                    [VoiceFlowNodeType.EnqueueOption]: EnqueueOptionNode,
                }}
                edges={[]}
            />
        </FlowProvider>,
    )
}

describe('EnqueueOptionNode', () => {
    it('should render correct label', () => {
        renderComponent()

        expect(screen.getByText('Skip queue')).toBeInTheDocument()
        expect(screen.getByText('Default')).toBeInTheDocument()
    })
})
