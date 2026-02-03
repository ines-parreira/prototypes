import { render } from '@testing-library/react'
import { useReactFlow, useViewport } from '@xyflow/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from 'core/theme'
import type { VisualBuilderContextType } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import WorkflowVisualBuilder from '../WorkflowVisualBuilder'

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))

jest.mock('@xyflow/react', () => ({
    ...jest.requireActual('@xyflow/react'),
    useReactFlow: jest.fn(),
    useViewport: jest.fn(),
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockUseReactFlow = useReactFlow as jest.MockedFunction<
    typeof useReactFlow
>
const mockUseViewport = useViewport as jest.MockedFunction<typeof useViewport>

describe('WorkflowVisualBuilder colorMode', () => {
    const mockVisualBuilderGraph = {
        id: 'test-id',
        internal_id: 'test-internal-id',
        name: 'test',
        nodes: [],
        edges: [],
        nodeEditingId: null,
        available_languages: ['en-US'],
        choiceEventIdEditing: null,
        branchIdsEditing: [],
        is_draft: false,
        isTemplate: false,
    } as unknown as VisualBuilderGraph

    const mockContextValue: VisualBuilderContextType = {
        visualBuilderGraph: mockVisualBuilderGraph,
        initialVisualBuilderGraph: mockVisualBuilderGraph,
        checkNodeHasVariablesUsedInChildren: () => false,
        dispatch: jest.fn(),
        getVariableListInChildren: () => [],
        checkNewVisualBuilderNode: () => false,
        getVariableListForNode: jest.fn().mockReturnValue([]),
        isNew: false,
    }

    const renderComponent = () => {
        return render(
            <VisualBuilderContext.Provider value={mockContextValue}>
                <WorkflowVisualBuilder />
            </VisualBuilderContext.Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
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

    it('should set colorMode to dark when theme is dark', () => {
        mockUseTheme.mockReturnValue({
            resolvedName: THEME_NAME.Dark,
        } as ReturnType<typeof useTheme>)

        const { container } = renderComponent()

        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toHaveClass('dark')
    })

    it('should set colorMode to light when theme is light', () => {
        mockUseTheme.mockReturnValue({
            resolvedName: THEME_NAME.Light,
        } as ReturnType<typeof useTheme>)

        const { container } = renderComponent()

        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toHaveClass('light')
    })

    it('should set colorMode to light when theme is neither dark nor light', () => {
        mockUseTheme.mockReturnValue({
            resolvedName: 'some-other-theme',
        } as unknown as ReturnType<typeof useTheme>)

        const { container } = renderComponent()

        const reactFlowWrapper = container.querySelector('.react-flow')
        expect(reactFlowWrapper).toHaveClass('light')
    })
})
