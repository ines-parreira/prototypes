import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowEdge, VoiceFlowPreviewEdge } from '../VoiceFlowEdge'

/* ReactFlow is not rendering the edge label in tests */
jest.mock('core/ui/flows/components/CustomEdge', () => ({
    CustomEdge: ({ children, isDisabled }: any) => (
        <div data-testid="custom-edge" data-disabled={isDisabled}>
            {children}
        </div>
    ),
}))

const mockGetNode = jest.fn()

jest.mock('../useVoiceFlow', () => ({
    useVoiceFlow: () => ({
        getNode: mockGetNode,
    }),
}))
jest.mock('../AddStepMenuContent', () => () => {
    return <div>Add step</div>
})

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

    it('should not be disabled when isDisabled is false', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.EndCall,
        })

        render(<VoiceFlowEdge {...defaultProps} isDisabled={false} />)

        const edge = screen.getByTestId('custom-edge')
        expect(edge).toHaveAttribute('data-disabled', 'false')
    })

    it('should be disabled when isDisabled is true', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.EndCall,
        })

        render(<VoiceFlowEdge {...defaultProps} isDisabled={true} />)

        const edge = screen.getByTestId('custom-edge')
        expect(edge).toHaveAttribute('data-disabled', 'true')
    })
})

describe('VoiceFlowPreviewEdge', () => {
    it('should render as disabled edge', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.EndCall,
        })

        render(<VoiceFlowPreviewEdge {...defaultProps} />)

        const edge = screen.getByTestId('custom-edge')
        expect(edge).toHaveAttribute('data-disabled', 'true')
    })

    it('should render with menu options when canAddNewStepOnEdge is true but disabled', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.EndCall,
        })

        render(<VoiceFlowPreviewEdge {...defaultProps} />)

        expect(screen.getByText('Add step')).toBeInTheDocument()
        const edge = screen.getByTestId('custom-edge')
        expect(edge).toHaveAttribute('data-disabled', 'true')
    })

    it('should not render menu options when canAddNewStepOnEdge is false', () => {
        mockGetNode.mockReturnValue({
            type: VoiceFlowNodeType.IvrMenu,
        })

        render(<VoiceFlowPreviewEdge {...defaultProps} />)

        expect(screen.queryByText('Add step')).not.toBeInTheDocument()
        const edge = screen.getByTestId('custom-edge')
        expect(edge).toHaveAttribute('data-disabled', 'true')
    })
})
