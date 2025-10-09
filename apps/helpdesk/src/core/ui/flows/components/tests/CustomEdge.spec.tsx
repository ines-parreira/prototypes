import { render, screen } from '@testing-library/react'
import { EdgeProps, Position, ReactFlowProvider } from '@xyflow/react'

import { CustomEdge } from '../CustomEdge'

// Mock EdgeLabelRenderer to render children directly instead of using portals
jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="edge-label-renderer">{children}</div>
    ),
}))

const mockEdgeProps: EdgeProps = {
    id: 'test-edge',
    sourceX: 100,
    sourceY: 50,
    targetX: 200,
    targetY: 250,
    sourcePosition: 'bottom' as Position,
    targetPosition: 'top' as Position,
    markerEnd: 'url(#arrow)',
} as EdgeProps

const renderEdgeWithProvider = (edge: React.ReactElement) => {
    return render(<ReactFlowProvider>{edge}</ReactFlowProvider>)
}

describe('CustomEdge', () => {
    it('should render edge without children', () => {
        renderEdgeWithProvider(<CustomEdge {...mockEdgeProps} />)

        // Edge should render without a button when no children provided
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render edge with button when children provided', () => {
        renderEdgeWithProvider(
            <CustomEdge {...mockEdgeProps}>Add step</CustomEdge>,
        )

        // Edge should render with a button when children are provided
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('aria-label', 'Add')

        // The children content should be available in the edge label renderer
        expect(screen.getByTestId('edge-label-renderer')).toBeInTheDocument()
    })

    it('should render edge path element', () => {
        const { container } = renderEdgeWithProvider(
            <CustomEdge {...mockEdgeProps} />,
        )

        // Should render the SVG path element for the edge
        const pathElement = container.querySelector('path')
        expect(pathElement).toBeInTheDocument()
    })

    it('should render enabled button when isDisabled is false', () => {
        renderEdgeWithProvider(
            <CustomEdge {...mockEdgeProps} isDisabled={false}>
                Add step
            </CustomEdge>,
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
    })

    it('should render disabled button when isDisabled is true', () => {
        renderEdgeWithProvider(
            <CustomEdge {...mockEdgeProps} isDisabled={true}>
                Add step
            </CustomEdge>,
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
    })

    it('should render enabled button by default when isDisabled is not provided', () => {
        renderEdgeWithProvider(
            <CustomEdge {...mockEdgeProps}>Add step</CustomEdge>,
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
    })
})
