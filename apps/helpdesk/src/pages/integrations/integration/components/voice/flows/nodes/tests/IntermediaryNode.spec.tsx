import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { FlowProvider } from 'core/ui/flows'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowNode } from '../../types'
import { getSourceNodes } from '../../utils'
import { IntermediaryNode } from '../IntermediaryNode'

jest.mock('../../utils')
const mockGetSourceNodes = assumeMock(getSourceNodes)

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
        mockGetSourceNodes.mockReturnValue([
            { id: 'node-1', type: VoiceFlowNodeType.PlayMessage },
            { id: 'node-2', type: VoiceFlowNodeType.IvrMenu },
        ] as VoiceFlowNode[])
        renderComponent()

        expect(screen.getByLabelText('Add')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should render empty div when all converging nodes are final nodes', () => {
        mockGetSourceNodes.mockReturnValue([
            { id: 'node-1', type: VoiceFlowNodeType.SendToSMS },
            { id: 'node-2', type: VoiceFlowNodeType.SendToVoicemail },
        ] as VoiceFlowNode[])

        const { container } = renderComponent()

        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument()

        const emptyDiv = container.querySelector('div[style*="height: 1px"]')
        expect(emptyDiv).toBeInTheDocument()
        expect(emptyDiv).toHaveStyle({
            height: '1px',
            width: '1px',
        })
    })

    it('should render empty div when just one converging node is not final', () => {
        mockGetSourceNodes.mockReturnValue([
            { id: 'node-1', type: VoiceFlowNodeType.SendToSMS },
            { id: 'node-2', type: VoiceFlowNodeType.PlayMessage },
            { id: 'node-3', type: VoiceFlowNodeType.SendToVoicemail },
        ] as VoiceFlowNode[])

        const { container } = renderComponent()

        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument()

        const emptyDiv = container.querySelector('div[style*="height: 1px"]')
        expect(emptyDiv).toBeInTheDocument()
        expect(emptyDiv).toHaveStyle({
            height: '1px',
            width: '1px',
        })
    })

    it('should not render AddStepButton when some converging nodes are final and some are not', () => {
        mockGetSourceNodes.mockReturnValue([
            { id: 'node-1', type: VoiceFlowNodeType.SendToSMS },
            { id: 'node-2', type: VoiceFlowNodeType.PlayMessage },
            { id: 'node-3', type: VoiceFlowNodeType.IvrOption },
            { id: 'node-4', type: VoiceFlowNodeType.SendToVoicemail },
            { id: 'node-5', type: VoiceFlowNodeType.IvrOption },
        ] as VoiceFlowNode[])

        renderComponent()

        expect(screen.queryByLabelText('Add')).not.toBeInTheDocument()
    })

    it('should handle empty converging nodes array', () => {
        mockGetSourceNodes.mockReturnValue([])
        renderComponent({
            data: {
                next_step_id: 'next-node',
            },
        })

        // Empty array with .some() returns false, so it renders the add button
        expect(screen.queryByLabelText('Add')).toBeInTheDocument()
    })
})
