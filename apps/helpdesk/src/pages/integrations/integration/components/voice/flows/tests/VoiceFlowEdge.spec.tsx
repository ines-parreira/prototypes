import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowEdge } from '../VoiceFlowEdge'

/* ReactFlow is not rendering the edge label in tests */
jest.mock('core/ui/flows/components/CustomEdge', () => ({
    CustomEdge: ({ children }: any) => <div>{children}</div>,
}))

const mockGetNode = jest.fn()

jest.mock('../useVoiceFlow', () => ({
    useVoiceFlow: () => ({
        getNode: mockGetNode,
    }),
}))

const defaultProps = {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    sourceX: 0,
    sourceY: 0,
} as ComponentProps<typeof VoiceFlowEdge>

describe('VoiceFlowEdge', () => {
    it('should render with menu options when canAddNewStepOnEdge is true', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.EndCall,
        })

        render(<VoiceFlowEdge {...defaultProps} />)

        expect(screen.getByText('Add step')).toBeInTheDocument()
    })

    it('should not render with menu options when canAddNewStepOnEdge is false', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.IvrMenu,
        })

        render(<VoiceFlowEdge {...defaultProps} />)

        expect(screen.queryByText('Add step')).not.toBeInTheDocument()
    })
})
