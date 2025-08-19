import { render, screen } from '@testing-library/react'
import { Edge } from '@xyflow/react'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowNode } from '../types'
import { VoiceFlow } from '../VoiceFlow'

describe('VoiceFlow', () => {
    const mockNodes: VoiceFlowNode[] = [
        {
            id: 'node-1',
            type: VoiceFlowNodeType.IncomingCall,
            position: { x: 100, y: 100 },
            data: {},
        },
        {
            id: 'node-2',
            type: VoiceFlowNodeType.EndCall,
            position: { x: 100, y: 300 },
            data: {},
        },
    ]

    const mockEdges: Edge[] = [
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
        },
    ]

    it('should render without nodes and edges', () => {
        const { container } = render(<VoiceFlow />)

        // no nodes or edges should be rendered
        expect(container.querySelector('.react-flow')).toBeInTheDocument()

        // check for background and controls
        expect(
            container.querySelector('.react-flow__background'),
        ).toBeInTheDocument()
        expect(screen.getByText('zoom_in')).toBeInTheDocument()
        expect(screen.getByText('zoom_out')).toBeInTheDocument()
        expect(screen.getByText('filter_center_focus')).toBeInTheDocument()
        expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should render incoming & end call nodes', () => {
        const { getByText } = render(
            <VoiceFlow nodes={mockNodes} edges={mockEdges} />,
        )

        expect(getByText('Incoming Call')).toBeInTheDocument()
        expect(getByText('End Call')).toBeInTheDocument()
    })
})
