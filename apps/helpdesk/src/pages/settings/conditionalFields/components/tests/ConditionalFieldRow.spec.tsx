import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router-dom'

import { customFieldCondition } from 'fixtures/customFieldCondition'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { DndProvider } from 'utils/wrappers/DndProvider'

import ConditionalFieldRow from '../ConditionalFieldRow'

const mockCreateCondition = jest.fn().mockResolvedValue({ data: { id: 123 } })
const mockUpdateCondition = jest.fn().mockResolvedValue({})
const mockDeleteCondition = jest.fn().mockResolvedValue({})

jest.mock(
    '@gorgias/helpdesk-queries',
    () =>
        ({
            ...jest.requireActual('@gorgias/helpdesk-queries'),
            useListCustomFieldConditions: jest.fn(),
            useCreateCustomFieldCondition: () => ({
                mutateAsync: mockCreateCondition,
                isLoading: false,
            }),
            useUpdateCustomFieldCondition: () => ({
                mutateAsync: mockUpdateCondition,
                isLoading: false,
            }),
            useDeleteCustomFieldCondition: () => ({
                mutateAsync: mockDeleteCondition,
                isLoading: false,
            }),
        }) as Record<string, unknown>,
)

const baseProps = {
    position: 0,
    onMoveEntity: jest.fn(),
    onDropEntity: jest.fn(),
}

describe('<CustomFieldRow />', () => {
    it('should render', () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFieldRow
                        {...baseProps}
                        condition={customFieldCondition}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        expect(screen.getByText(customFieldCondition.name)).toBeDefined()
    })

    it('should create a new condition when clicking the duplicate button', () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFieldRow
                        {...baseProps}
                        condition={customFieldCondition}
                        canDuplicate
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByTitle('Duplicate Condition'))
        expect(mockCreateCondition).toHaveBeenCalled()
    })

    it('should delete the condition with confirmation when clicking the delete button', () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFieldRow
                        {...baseProps}
                        condition={customFieldCondition}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByTitle('Delete Condition'))
        expect(mockDeleteCondition).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText(/Confirm/))
        expect(mockDeleteCondition).toHaveBeenCalledWith({
            id: customFieldCondition.id,
        })
    })

    it('should enable the condition without confirmation when clicking the ON toggle', () => {
        const deactivatedCondition = {
            ...customFieldCondition,
            deactivated_datetime: '2024-07-29T09:09:41.626092+00:00',
        }
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFieldRow
                        {...baseProps}
                        condition={deactivatedCondition}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByRole('switch'))
        expect(mockUpdateCondition).toHaveBeenCalledWith({
            id: deactivatedCondition.id,
            data: { deactivated_datetime: null },
        })
    })

    it('should disable the condition with confirmation when clicking the OFF toggle', () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFieldRow
                        {...baseProps}
                        condition={customFieldCondition}
                    />
                </DndProvider>
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByRole('switch'))
        expect(mockUpdateCondition).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText(/Confirm/))
        expect(mockUpdateCondition).toHaveBeenCalledWith({
            id: customFieldCondition.id,
            data: {
                deactivated_datetime: expect.any(String),
            },
        })
    })
})
