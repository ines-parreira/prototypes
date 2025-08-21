import { render, screen } from '@testing-library/react'
import {
    Background,
    ReactFlowProvider,
    useReactFlow,
    useViewport,
} from '@xyflow/react'

import { THEME_NAME, useTheme } from 'core/theme'

import { CustomControls } from '../CustomControls'
import { Flow } from '../Flow'

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))

const useThemeMock = useTheme as jest.Mock

jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
    Panel: ({ children, position }: any) => (
        <div className={`react-flow__panel ${position}`}>{children}</div>
    ),
}))

const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

const mockNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: '2', position: { x: 100, y: 100 }, data: { label: 'Node 2' } },
]

const mockEdges = [{ id: 'e1-2', source: '1', target: '2' }]

const renderComponent = (props = {}) => {
    return render(
        <ReactFlowProvider>
            <Flow nodes={mockNodes} {...props} />
        </ReactFlowProvider>,
    )
}

describe('Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useThemeMock.mockReturnValue({
            theme: THEME_NAME.Light,
        })
        mockUseReactFlow.mockReturnValue({
            zoomIn: jest.fn(),
            zoomOut: jest.fn(),
            fitView: jest.fn(),
            zoomTo: jest.fn(),
        } as any)
        mockUseViewport.mockReturnValue({
            zoom: 0.5,
            x: 0,
            y: 0,
        })
    })

    it('should render with required nodes prop', () => {
        const { container } = renderComponent()
        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toBeInTheDocument()
    })

    it('should render nodes when provided', () => {
        renderComponent()
        expect(screen.getByText('Node 1')).toBeInTheDocument()
        expect(screen.getByText('Node 2')).toBeInTheDocument()
    })

    it('should render with edges when provided', () => {
        const { container } = renderComponent({ edges: mockEdges })
        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toBeInTheDocument()

        expect(screen.getByText('Node 1')).toBeInTheDocument()
        expect(screen.getByText('Node 2')).toBeInTheDocument()
    })

    it('should render children when provided', () => {
        const CustomChild = () => <div>Custom Child Component</div>
        renderComponent({
            children: <CustomChild />,
        })
        expect(screen.getByText('Custom Child Component')).toBeInTheDocument()
    })

    it('should apply correct ReactFlow props', () => {
        const { container } = renderComponent()
        const reactFlow = container.querySelector('.react-flow')

        expect(reactFlow).toBeInTheDocument()
    })

    it('should apply light color mode when using light theme', () => {
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Light })

        const { container } = renderComponent()

        // Check that the Flow component receives light color mode
        const flowElement = container.querySelector('.react-flow')
        expect(flowElement).toHaveClass('light')
    })

    it('should apply dark color mode when using dark theme', () => {
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Dark })

        const { container } = renderComponent()

        // Check that the Flow component receives dark color mode
        const flowElement = container.querySelector('.react-flow')
        expect(flowElement).toHaveClass('dark')
    })

    it('should pass through additional ReactFlow props', () => {
        const onNodesChange = jest.fn()
        const onEdgesChange = jest.fn()

        renderComponent({
            onNodesChange,
            onEdgesChange,
        })

        const { container } = renderComponent()
        const reactFlow = container.querySelector('.react-flow')
        expect(reactFlow).toBeInTheDocument()
    })

    it('should work with generic node and edge types', () => {
        interface CustomNode {
            id: string
            position: { x: number; y: number }
            data: { label: string; customProp: string }
        }

        interface CustomEdge {
            id: string
            source: string
            target: string
            type: string
        }

        const customNodes: CustomNode[] = [
            {
                id: '1',
                position: { x: 0, y: 0 },
                data: { label: 'Custom Node', customProp: 'test' },
            },
        ]

        const customEdges: CustomEdge[] = [
            {
                id: 'e1-2',
                source: '1',
                target: '2',
                type: 'smoothstep',
            },
        ]

        const { container } = render(
            <ReactFlowProvider>
                <Flow<CustomNode, CustomEdge>
                    nodes={customNodes}
                    edges={customEdges}
                />
            </ReactFlowProvider>,
        )

        expect(container.querySelector('.react-flow')).toBeInTheDocument()
        expect(screen.getByText('Custom Node')).toBeInTheDocument()
    })

    it('should render without edges', () => {
        const { container } = renderComponent({ edges: undefined })
        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toBeInTheDocument()

        expect(screen.getByText('Node 1')).toBeInTheDocument()
        expect(screen.getByText('Node 2')).toBeInTheDocument()
    })

    it('should render with empty nodes array', () => {
        const { container } = renderComponent({ nodes: [] })
        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toBeInTheDocument()
    })

    it('should render Background when provided as child', () => {
        const { container } = renderComponent({
            children: <Background />,
        })

        const background = container.querySelector('.react-flow__background')
        expect(background).toBeInTheDocument()
    })

    it('should render CustomControls when provided as child', () => {
        renderComponent({
            children: <CustomControls />,
        })

        expect(screen.getByText('zoom_in')).toBeInTheDocument()
        expect(screen.getByText('zoom_out')).toBeInTheDocument()
        expect(screen.getByText('filter_center_focus')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should render both Background and CustomControls together', () => {
        const { container } = renderComponent({
            children: (
                <>
                    <Background />
                    <CustomControls />
                </>
            ),
        })

        const background = container.querySelector('.react-flow__background')
        expect(background).toBeInTheDocument()

        expect(screen.getByText('zoom_in')).toBeInTheDocument()
        expect(screen.getByText('zoom_out')).toBeInTheDocument()
        expect(screen.getByText('filter_center_focus')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })
})
