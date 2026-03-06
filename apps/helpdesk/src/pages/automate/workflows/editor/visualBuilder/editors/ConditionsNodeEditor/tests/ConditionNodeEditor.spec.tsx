import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'

import ConditionsNodeEditor from '../ConditionsNodeEditor'

jest.mock('pages/automate/workflows/hooks/useVisualBuilder', () => ({
    useVisualBuilderContext: jest.fn(),
}))

jest.mock('pages/common/components/accordion/SortableAccordion', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('pages/common/components/accordion/SortableAccordionItem', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../utils', () => ({
    buildConditionSchemaByVariableType: jest.fn(() => ({
        equals: [{ var: 'steps_state.ticket.id' }, 'mock-value'],
    })),
}))

jest.mock('../ConditionsBranchItem', () => ({
    ConditionsBranchItem: ({
        branchId,
        onConditionDelete,
        onVariableSelect,
        onConditionChange,
    }: any) => (
        <div>
            <button
                type="button"
                onClick={() => {
                    onConditionDelete(0)
                }}
            >
                Delete first condition {branchId}
            </button>
            <button
                type="button"
                onClick={() => {
                    onVariableSelect({
                        type: 'string',
                        value: 'steps_state.ticket.id',
                    })
                }}
            >
                Add variable {branchId}
            </button>
            <button
                type="button"
                onClick={() => {
                    onConditionChange(
                        {
                            equals: [
                                { var: 'steps_state.ticket.id' },
                                'updated-value',
                            ],
                        },
                        0,
                    )
                }}
            >
                Update condition {branchId}
            </button>
        </div>
    ),
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

        expect(screen.getByText('Step name')).toBeInTheDocument()
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

    it('updates branch condition payloads for both or and and branches', () => {
        const orCondition = {
            equals: [{ var: 'steps_state.ticket.id' }, 'or-value'],
        }
        const andCondition = {
            equals: [{ var: 'steps_state.ticket.id' }, 'and-value'],
        }

        ;(useVisualBuilderContext as jest.Mock).mockReturnValue({
            visualBuilderGraph: {
                edges: [
                    {
                        id: 'branch-or',
                        source: '1',
                        target: 'or-target',
                        data: {
                            name: 'OR branch',
                            conditions: { or: [orCondition] },
                        },
                    },
                    {
                        id: 'branch-and',
                        source: '1',
                        target: 'and-target',
                        data: {
                            name: 'AND branch',
                            conditions: { and: [andCondition] },
                        },
                    },
                    {
                        id: 'fallback',
                        source: '1',
                        target: 'end-node',
                        data: {},
                    },
                ],
                nodes: [
                    { id: '1', type: 'llm_prompt_trigger' },
                    { id: 'or-target', type: 'end' },
                    { id: 'and-target', type: 'end' },
                    { id: 'end-node', type: 'end' },
                ],
                branchIdsEditing: [],
            },
            dispatch: mockDispatch,
            getVariableListForNode: mockGetVariableListForNode,
        })

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

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Delete first condition branch-or',
            }),
        )
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Delete first condition branch-and',
            }),
        )
        fireEvent.click(
            screen.getByRole('button', { name: 'Add variable branch-or' }),
        )
        fireEvent.click(
            screen.getByRole('button', { name: 'Add variable branch-and' }),
        )
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Update condition branch-or',
            }),
        )
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Update condition branch-and',
            }),
        )

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-or',
            data: {
                name: 'OR branch',
                conditions: { or: [] },
            },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-and',
            data: {
                name: 'AND branch',
                conditions: { and: [] },
            },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-or',
            data: {
                name: 'OR branch',
                conditions: {
                    or: [
                        orCondition,
                        {
                            equals: [
                                { var: 'steps_state.ticket.id' },
                                'mock-value',
                            ],
                        },
                    ],
                },
            },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-and',
            data: {
                name: 'AND branch',
                conditions: {
                    and: [
                        andCondition,
                        {
                            equals: [
                                { var: 'steps_state.ticket.id' },
                                'mock-value',
                            ],
                        },
                    ],
                },
            },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-or',
            data: {
                name: 'OR branch',
                conditions: {
                    or: [
                        {
                            equals: [
                                { var: 'steps_state.ticket.id' },
                                'updated-value',
                            ],
                        },
                    ],
                },
            },
        })
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'UPDATE_CONDITIONS_NODE_BRANCH',
            nodeId: 'branch-and',
            data: {
                name: 'AND branch',
                conditions: {
                    and: [
                        {
                            equals: [
                                { var: 'steps_state.ticket.id' },
                                'updated-value',
                            ],
                        },
                    ],
                },
            },
        })
    })
})
