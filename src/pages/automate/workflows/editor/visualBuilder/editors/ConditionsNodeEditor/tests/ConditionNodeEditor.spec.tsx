import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'

import ConditionsNodeEditor from '../ConditionsNodeEditor'

jest.mock('pages/automate/workflows/hooks/useVisualBuilder', () => ({
    useVisualBuilderContext: jest.fn(),
}))

describe('ConditionsNodeEditor', () => {
    const mockDispatch = jest.fn()
    const mockGetVariableListForNode = jest.fn()

    beforeEach(() => {
        mockDispatch.mockClear()
        mockGetVariableListForNode.mockClear()
        ;(useVisualBuilderContext as jest.Mock).mockReturnValue({
            visualBuilderGraph: {
                edges: [],
                nodes: [{ id: '1', type: 'llm_prompt_trigger' }],
            },
            dispatch: mockDispatch,
            getVariableListForNode: mockGetVariableListForNode,
        })
    })

    it.each([
        'llm_prompt_trigger',
        'reusable_llm_prompt_trigger',
        'channel_trigger',
    ])('renders correctly', (type) => {
        ;(useVisualBuilderContext as jest.Mock).mockReturnValue({
            visualBuilderGraph: {
                edges: [],
                nodes: [{ id: '1', type }],
            },
            dispatch: mockDispatch,
            getVariableListForNode: mockGetVariableListForNode,
        })
        const screen = render(
            <ConditionsNodeEditor
                nodeInEdition={{
                    position: { x: 0, y: 0 },
                    id: '1',
                    data: { name: 'Test Node' },
                    type: 'conditions',
                }}
            />,
        )

        expect(screen.getByText('Step Name')).toBeInTheDocument()
        const conditionsInput = screen.container.querySelector('#conditions')
        expect(conditionsInput).toHaveValue('Test Node')
    })

    it('adds a condition branch when the "Add Branch" button is clicked', async () => {
        render(
            <ConditionsNodeEditor
                nodeInEdition={{
                    position: { x: 0, y: 0 },
                    id: '1',
                    data: { name: 'Test Node' },
                    type: 'conditions',
                }}
            />,
        )

        const addBranchButton = screen.getByRole('button', {
            name: /Add Branch/i,
        })
        fireEvent.click(addBranchButton)

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'ADD_CONDITIONS_NODE_BRANCH',
                conditionNodeId: '1',
                edgeId: expect.any(String),
            })
        })
    })

    it('handles condition changes correctly', async () => {
        const screen = render(
            <ConditionsNodeEditor
                nodeInEdition={{
                    position: { x: 0, y: 0 },
                    id: '1',
                    data: { name: 'Test Node' },
                    type: 'conditions',
                }}
            />,
        )

        mockGetVariableListForNode.mockReturnValue([])

        fireEvent.click(screen.getByText('Add Branch'))
        await waitFor(() => {
            expect(
                screen.getByText(
                    'branches are evaluated in the order below, names not visible to customers',
                ),
            ).toBeInTheDocument()
        })

        const conditionInput = screen.container.querySelector('#conditions')

        fireEvent.change(conditionInput!, {
            target: { value: 'Updated Condition Name' },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_NAME',
            nodeId: '1',
            name: 'Updated Condition Name',
        })
    })
})
