import { render, screen } from '@testing-library/react'
import { Edge } from '@xyflow/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from 'core/theme'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowNode } from '../types'
import { VoiceFlow } from '../VoiceFlow'

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))

const useThemeMock = useTheme as jest.Mock

describe('VoiceFlow', () => {
    beforeEach(() => {
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Light })
    })

    const mockNodes: VoiceFlowNode[] = [
        {
            id: 'node-1',
            type: VoiceFlowNodeType.IncomingCall,
            position: { x: 100, y: 100 },
            data: {
                next_step_id: 'node-2',
            },
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

    it('should apply light color mode when using light theme', () => {
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Light })

        const { container } = render(<VoiceFlow />)

        // Check that the Flow component receives light color mode
        const flowElement = container.querySelector('.react-flow')
        expect(flowElement).toHaveClass('light')
    })

    it('should apply dark color mode when using dark theme', () => {
        useThemeMock.mockReturnValue({ resolvedName: THEME_NAME.Dark })

        const { container } = render(<VoiceFlow />)

        // Check that the Flow component receives dark color mode
        const flowElement = container.querySelector('.react-flow')
        expect(flowElement).toHaveClass('dark')
    })
})
