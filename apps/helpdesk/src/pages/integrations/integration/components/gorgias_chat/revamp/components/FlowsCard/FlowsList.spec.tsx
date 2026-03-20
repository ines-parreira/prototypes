import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import type { Callbacks } from 'pages/common/hooks/useReorderDnD'

import { FlowsList } from './FlowsList'
import type { Workflow, WorkflowConfiguration } from './types'

const mockUseReorderDnD = jest.fn()
jest.mock('pages/common/hooks/useReorderDnD', () => ({
    useReorderDnD: (...args: unknown[]) => mockUseReorderDnD(...args),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const defaultMockReturn = {
    dragRef: { current: null },
    dropRef: { current: null },
    handlerId: null,
    isDragging: false,
}

const mockWorkflows: Workflow[] = [
    { workflow_id: 'workflow-1', enabled: true },
    { workflow_id: 'workflow-2', enabled: true },
    { workflow_id: 'workflow-3', enabled: true },
]

const mockConfigurationsMap: Record<string, WorkflowConfiguration> = {
    'workflow-1': {
        id: 'workflow-1',
        name: 'Order Status Flow',
    } as WorkflowConfiguration,
    'workflow-2': {
        id: 'workflow-2',
        name: 'Return Request Flow',
    } as WorkflowConfiguration,
    'workflow-3': {
        id: 'workflow-3',
        name: 'Shipping Info Flow',
    } as WorkflowConfiguration,
}

const defaultProps = {
    items: mockWorkflows,
    channelType: 'chat',
    configurationsMap: mockConfigurationsMap,
    getEditFlowLink: (workflowId: string) =>
        `/app/automation/shopify/test-shop/flows/edit/${workflowId}`,
    onReorder: jest.fn(),
    onRemove: jest.fn(),
}

const renderComponent = (props: Partial<typeof defaultProps> = {}) => {
    return render(
        <MemoryRouter>
            <FlowsList {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('FlowsList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseReorderDnD.mockReturnValue(defaultMockReturn)
    })

    it('should render all flow items', () => {
        renderComponent()

        expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
        expect(screen.getByText('Return Request Flow')).toBeInTheDocument()
        expect(screen.getByText('Shipping Info Flow')).toBeInTheDocument()
    })

    it('should render nothing when items array is empty', () => {
        const { container } = renderComponent({ items: [] })

        expect(container).toBeEmptyDOMElement()
    })

    it('should navigate to correct edit URL when edit button is clicked for each flow', async () => {
        const user = userEvent.setup()
        renderComponent()

        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        expect(editButtons).toHaveLength(3)

        await user.click(editButtons[0])
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/flows/edit/workflow-1',
        )

        mockHistoryPush.mockClear()
        await user.click(editButtons[1])
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/flows/edit/workflow-2',
        )

        mockHistoryPush.mockClear()
        await user.click(editButtons[2])
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/automation/shopify/test-shop/flows/edit/workflow-3',
        )
    })

    it('should call onRemove with correct workflowId when remove button is clicked', async () => {
        const user = userEvent.setup()
        const onRemove = jest.fn()
        renderComponent({ onRemove })

        const removeButtons = screen.getAllByRole('button', {
            name: /remove/i,
        })
        await user.click(removeButtons[0])

        expect(onRemove).toHaveBeenCalledWith('workflow-1')
    })

    it('should call onRemove for the correct workflow when clicking different remove buttons', async () => {
        const user = userEvent.setup()
        const onRemove = jest.fn()
        renderComponent({ onRemove })

        const removeButtons = screen.getAllByRole('button', {
            name: /remove/i,
        })
        await user.click(removeButtons[1])

        expect(onRemove).toHaveBeenCalledWith('workflow-2')
    })

    it('should render empty label when configuration is not found', () => {
        const incompleteConfigurationsMap: Record<
            string,
            WorkflowConfiguration
        > = {
            'workflow-1': {
                id: 'workflow-1',
                name: 'Order Status Flow',
            } as WorkflowConfiguration,
        }

        renderComponent({
            items: [
                { workflow_id: 'workflow-1', enabled: true },
                { workflow_id: 'workflow-missing', enabled: true },
            ],
            configurationsMap: incompleteConfigurationsMap,
        })

        expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
    })

    it('should render single flow item correctly', () => {
        renderComponent({
            items: [{ workflow_id: 'workflow-1', enabled: true }],
        })

        expect(screen.getByText('Order Status Flow')).toBeInTheDocument()
        expect(
            screen.queryByText('Return Request Flow'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Shipping Info Flow')).not.toBeInTheDocument()
    })

    it('should use custom getEditFlowLink function', async () => {
        const user = userEvent.setup()
        const customGetEditFlowLink = (workflowId: string) =>
            `/custom/path/${workflowId}`

        renderComponent({ getEditFlowLink: customGetEditFlowLink })

        const editButtons = screen.getAllByRole('button', { name: /edit/i })
        await user.click(editButtons[0])

        expect(mockHistoryPush).toHaveBeenCalledWith('/custom/path/workflow-1')
    })

    describe('drag and drop reordering', () => {
        it('should call onReorder when items are dropped in a different order', () => {
            const onReorder = jest.fn()
            let capturedCallbacks: Callbacks = {}

            mockUseReorderDnD.mockImplementation(
                (_dragItem, _acceptEntities, callbacks) => {
                    capturedCallbacks = callbacks
                    return defaultMockReturn
                },
            )

            renderComponent({ onReorder })

            act(() => {
                capturedCallbacks.onHover?.(0, 1, 'flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onDrop?.({} as never, {} as never)
            })

            expect(onReorder).toHaveBeenCalledWith([
                { workflow_id: 'workflow-2', enabled: true },
                { workflow_id: 'workflow-1', enabled: true },
                { workflow_id: 'workflow-3', enabled: true },
            ])
        })

        it('should not call onReorder when drop happens without move', () => {
            const onReorder = jest.fn()
            let capturedCallbacks: Callbacks = {}

            mockUseReorderDnD.mockImplementation(
                (_dragItem, _acceptEntities, callbacks) => {
                    capturedCallbacks = callbacks
                    return defaultMockReturn
                },
            )

            renderComponent({ onReorder })

            capturedCallbacks.onDrop?.({} as never, {} as never)

            expect(onReorder).not.toHaveBeenCalled()
        })

        it('should not call onReorder when items are dropped in the same order', () => {
            const onReorder = jest.fn()
            let capturedCallbacks: Callbacks = {}

            mockUseReorderDnD.mockImplementation(
                (_dragItem, _acceptEntities, callbacks) => {
                    capturedCallbacks = callbacks
                    return defaultMockReturn
                },
            )

            renderComponent({ onReorder })

            act(() => {
                capturedCallbacks.onHover?.(0, 1, 'flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onHover?.(1, 0, 'flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onDrop?.({} as never, {} as never)
            })

            expect(onReorder).not.toHaveBeenCalled()
        })

        it('should reset dirty state when drag is cancelled', () => {
            const onReorder = jest.fn()
            let capturedCallbacks: Callbacks = {}

            mockUseReorderDnD.mockImplementation(
                (_dragItem, _acceptEntities, callbacks) => {
                    capturedCallbacks = callbacks
                    return defaultMockReturn
                },
            )

            renderComponent({ onReorder })

            act(() => {
                capturedCallbacks.onHover?.(0, 2, 'flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onCancel?.('flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onDrop?.({} as never, {} as never)
            })

            expect(onReorder).not.toHaveBeenCalled()
        })

        it('should handle move when drag item is not found', () => {
            const onReorder = jest.fn()
            let capturedCallbacks: Callbacks = {}

            mockUseReorderDnD.mockImplementation(
                (_dragItem, _acceptEntities, callbacks) => {
                    capturedCallbacks = callbacks
                    return defaultMockReturn
                },
            )

            renderComponent({ onReorder })

            act(() => {
                capturedCallbacks.onHover?.(99, 0, 'flows-revamp-chat')
            })
            act(() => {
                capturedCallbacks.onDrop?.({} as never, {} as never)
            })

            expect(onReorder).not.toHaveBeenCalled()
        })
    })
})
