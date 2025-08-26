import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { FlowProvider } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import { IntermediaryNode } from '../IntermediaryNode'

const mockGetNode = jest.fn()
const mockGetEdges = jest.fn()

jest.mock('../../useVoiceFlow', () => ({
    useVoiceFlow: () => ({
        getNode: mockGetNode,
        getEdges: mockGetEdges,
    }),
}))

const defaultProps = {
    id: 'intermediary-1',
    type: VoiceFlowNodeType.Intermediary,
    data: {
        next_step_id: 'next-node',
    },
} as ComponentProps<typeof IntermediaryNode>

const renderComponent = (
    props: Partial<ComponentProps<typeof IntermediaryNode>> = {},
) => {
    return render(
        <FlowProvider>
            <IntermediaryNode {...defaultProps} {...props} />
        </FlowProvider>,
    )
}

describe('IntermediaryNode', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render AddStepButton when converging nodes are not all final nodes', () => {
        mockGetNode.mockImplementation((id: string) => {
            if (id === 'node-1') {
                return { type: VoiceFlowNodeType.PlayMessage }
            }
            if (id === 'node-2') {
                return { type: VoiceFlowNodeType.IvrMenu }
            }
            return null
        })
        mockGetEdges.mockReturnValue([
            { source: 'node-1', target: 'intermediary-1' },
            { source: 'node-2', target: 'intermediary-1' },
            { source: 'node-3', target: 'intermediary-5' }, // should be ignored
        ])

        renderComponent()

        expect(screen.getByLabelText('Add')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should render empty div when all converging nodes are final nodes', () => {
        mockGetNode.mockImplementation((id: string) => {
            if (id === 'node-1') {
                return { type: VoiceFlowNodeType.SendToVoicemail }
            }
            if (id === 'node-2') {
                return { type: VoiceFlowNodeType.SendToSMS }
            }
            return null
        })
        mockGetEdges.mockReturnValue([
            { source: 'node-1', target: 'intermediary-1' },
            { source: 'node-2', target: 'intermediary-1' },
        ])

        const { container } = renderComponent()

        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument()

        const emptyDiv = container.querySelector('div[style*="height: 1px"]')
        expect(emptyDiv).toBeInTheDocument()
        expect(emptyDiv).toHaveStyle({
            height: '1px',
            width: '1px',
        })
    })

    it('should render AddStepButton when some converging nodes are final and some are not', () => {
        mockGetNode.mockImplementation((id: string) => {
            if (id === 'node-1') {
                return { type: VoiceFlowNodeType.SendToVoicemail }
            }
            if (id === 'node-2') {
                return { type: VoiceFlowNodeType.PlayMessage }
            }
            return null
        })
        mockGetEdges.mockReturnValue([
            { source: 'node-1', target: 'intermediary-1' },
            { source: 'node-2', target: 'intermediary-1' },
        ])

        renderComponent()

        expect(screen.getByLabelText('Add')).toBeInTheDocument()
    })

    it('should handle missing converging nodes gracefully', () => {
        mockGetNode.mockReturnValue(null)

        renderComponent()

        expect(screen.getByLabelText('Add')).toBeInTheDocument()
    })

    it('should handle empty converging nodes array', () => {
        mockGetEdges.mockReturnValue([])
        const { container } = renderComponent({
            data: {
                next_step_id: 'next-node',
            },
        })

        // Empty array with .every() returns true, so it renders the empty div
        const emptyDiv = container.querySelector('div[style*="height: 1px"]')
        expect(emptyDiv).toBeInTheDocument()
        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument()
    })
})
