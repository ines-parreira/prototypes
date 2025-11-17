import React from 'react'

import { render, screen } from '@testing-library/react'
import { EditorState } from 'draft-js'

import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import { contentStateFromTextOrHTML } from 'utils/editor'

import LiquidFilterPopover from '../LiquidFilterPopover'

const createMockEditorState = (value: string) => {
    return EditorState.createWithContent(contentStateFromTextOrHTML(value))
}

const mockVariables: WorkflowVariableList = [
    {
        name: 'HTTP request step',
        nodeType: 'http_request' as const,
        variables: [
            {
                name: 'date variable',
                value: 'steps_state.http_request1.content.variable1',
                nodeType: 'http_request' as const,
                type: 'date' as const,
            },
            {
                name: 'string variable',
                value: 'steps_state.http_request1.content.variable2',
                nodeType: 'http_request' as const,
                type: 'string' as const,
            },
        ],
    },
]

describe('<LiquidFilterPopover />', () => {
    const defaultProps = {
        isOpen: true,
        onToggle: jest.fn(),
        target: document.createElement('div'),
        entityKey: 'entity-key-1',
        editorState: createMockEditorState(
            '{{steps_state.http_request1.content.variable1 | date}}',
        ),
        variables: mockVariables,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Mock the draft-js entity functionality
        const mockEntity = {
            getData: () => ({
                value: '{{steps_state.http_request1.content.variable1 | date}}',
            }),
        }
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue(mockEntity),
        }
        defaultProps.editorState.getCurrentContent = jest
            .fn()
            .mockReturnValue(mockContentState)
    })

    it('should render popover when open with valid props', () => {
        render(<LiquidFilterPopover {...defaultProps} />)

        expect(screen.getByDisplayValue('date')).toBeInTheDocument()
    })

    it('should not render popover when closed', () => {
        render(<LiquidFilterPopover {...defaultProps} isOpen={false} />)

        expect(screen.queryByDisplayValue('date')).not.toBeInTheDocument()
    })

    it('should not render popover when target is null', () => {
        render(<LiquidFilterPopover {...defaultProps} target={null} />)

        expect(screen.queryByDisplayValue('date')).not.toBeInTheDocument()
    })

    it('should not render popover when entityKey is null', () => {
        render(<LiquidFilterPopover {...defaultProps} entityKey={null} />)

        expect(screen.queryByDisplayValue('date')).not.toBeInTheDocument()
    })

    it('should handle empty filter value', () => {
        const mockEntity = {
            getData: () => ({
                value: '{{steps_state.http_request1.content.variable1}}',
            }),
        }
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue(mockEntity),
        }
        const editorState = createMockEditorState(
            '{{steps_state.http_request1.content.variable1}}',
        )
        editorState.getCurrentContent = jest
            .fn()
            .mockReturnValue(mockContentState)

        render(
            <LiquidFilterPopover {...defaultProps} editorState={editorState} />,
        )

        expect(screen.getByDisplayValue('')).toBeInTheDocument()
    })

    it('should not render when variable is not found in variables list', () => {
        const mockEntity = {
            getData: () => ({ value: '{{steps_state.unknown.variable}}' }),
        }
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue(mockEntity),
        }
        const editorState = createMockEditorState(
            '{{steps_state.unknown.variable}}',
        )
        editorState.getCurrentContent = jest
            .fn()
            .mockReturnValue(mockContentState)

        render(
            <LiquidFilterPopover {...defaultProps} editorState={editorState} />,
        )

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should not render when variables prop is undefined', () => {
        render(<LiquidFilterPopover {...defaultProps} variables={undefined} />)

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should handle invalid liquid syntax gracefully', () => {
        const mockEntity = {
            getData: () => ({ value: 'invalid-liquid-syntax' }),
        }
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue(mockEntity),
        }
        const editorState = createMockEditorState('invalid-liquid-syntax')
        editorState.getCurrentContent = jest
            .fn()
            .mockReturnValue(mockContentState)

        render(
            <LiquidFilterPopover {...defaultProps} editorState={editorState} />,
        )

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('should focus the input when rendered', () => {
        render(<LiquidFilterPopover {...defaultProps} />)

        const filterInput = screen.getByDisplayValue('date')
        expect(filterInput).toHaveFocus()
    })

    it('should handle complex filter with multiple pipes', () => {
        const mockEntity = {
            getData: () => ({
                value: '{{steps_state.http_request1.content.variable1 | date | json | default: "null"}}',
            }),
        }
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue(mockEntity),
        }
        const editorState = createMockEditorState(
            '{{steps_state.http_request1.content.variable1 | date | json | default: "null"}}',
        )
        editorState.getCurrentContent = jest
            .fn()
            .mockReturnValue(mockContentState)

        render(
            <LiquidFilterPopover {...defaultProps} editorState={editorState} />,
        )

        expect(
            screen.getByDisplayValue('date | json | default: "null"'),
        ).toBeInTheDocument()
    })

    it('should render popover content when open', () => {
        render(<LiquidFilterPopover {...defaultProps} />)

        // Verify that the TextInput component is rendered
        const textInput = screen.getByRole('textbox')
        expect(textInput).toBeInTheDocument()
        expect(textInput).toHaveValue('date')
    })

    it('should have proper props passed to Popover', () => {
        const mockOnToggle = jest.fn()

        render(
            <LiquidFilterPopover {...defaultProps} onToggle={mockOnToggle} />,
        )

        // Verify that the popover is rendered with legacy trigger
        const popover = screen.getByRole('tooltip') // Popover often has tooltip role
        expect(popover).toBeInTheDocument()
    })
})
