import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { customFieldCondition } from 'fixtures/customFieldCondition'

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
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        expect(screen.getByText(customFieldCondition.name)).toBeDefined()
    })
    it('should create a new condition when clicking the duplicate button', () => {
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
                canDuplicate
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByTitle('Duplicate Condition'))
        expect(mockCreateCondition).toHaveBeenCalled()
    })
    it('should delete the condition with confirmation when clicking the delete button', () => {
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
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
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={deactivatedCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByRole('switch'))
        expect(mockUpdateCondition).toHaveBeenCalledWith({
            id: deactivatedCondition.id,
            data: { deactivated_datetime: null },
        })
    })
    it('should disable the condition with confirmation when clicking the OFF toggle', () => {
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
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
