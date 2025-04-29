import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useUpdateCustomFieldConditions from 'pages/settings/conditionalFields/hooks/useUpdateCustomFieldConditions'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { assumeMock, getLastMockCall } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import ConditionalFields, { MAX_CONDITIONS } from '../ConditionalFields'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as Record<string, unknown>,
)
jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(
                ({ children }: { children: React.ReactNode }) => children,
            ),
        }) as Record<string, unknown>,
)
jest.mock('custom-fields/hooks/queries/useCustomFieldConditions')
jest.mock(
    'pages/settings/conditionalFields/hooks/useUpdateCustomFieldConditions',
)
jest.mock('hooks/useDebouncedValue')

const useDebouncedValueMock = assumeMock(useDebouncedValue)
const mockedLogEvent = assumeMock(logEvent)
const mockedLink = assumeMock(Link)
const useCustomFieldConditionsMock = assumeMock(useCustomFieldConditions)
const useUpdateCustomFieldConditionsMock = assumeMock(
    useUpdateCustomFieldConditions,
)

const updateConditions = jest.fn()
useUpdateCustomFieldConditionsMock.mockReturnValue({
    mutate: updateConditions,
    isLoading: false,
    isSuccess: false,
} as any)

describe('<ConditionalFields/>', () => {
    beforeEach(() => {
        useDebouncedValueMock.mockReturnValue('')

        useCustomFieldConditionsMock.mockReturnValue({
            customFieldConditions: [],
            isLoading: false,
            isError: false,
        })
    })

    it('should render get started', () => {
        render(<ConditionalFields />)

        expect(
            screen.getByText(/Get started with Field Conditions/),
        ).toBeDefined()
        // expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it("should render a 'Create Condition' button", () => {
        render(<ConditionalFields />)

        const createConditionButton = screen.getByRole('button', {
            name: 'Create Condition',
        })
        expect(createConditionButton).toBeInTheDocument()
        getLastMockCall(mockedLink)[0].onClick?.(
            {} as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        )
        expect(mockedLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldCreateConditionClicked,
        )
    })

    it('should disable the create button when max limit is reached and display an alert', () => {
        useCustomFieldConditionsMock.mockReturnValue({
            customFieldConditions: Array.from(
                { length: MAX_CONDITIONS },
                (_, i) => ({
                    ...customFieldCondition,
                    id: i,
                }),
            ),
            isLoading: false,
            isError: false,
        })

        renderWithStoreAndQueryClientProvider(
            <DndProvider backend={HTML5Backend}>
                <ConditionalFields />
            </DndProvider>,
        )

        expect(screen.getByText(/You can only have/)).toBeDefined()
        expect(
            screen.getByRole('button', { name: 'Create Field' }),
        ).toBeAriaDisabled()
    })

    it('should render no results found', async () => {
        useCustomFieldConditionsMock.mockReturnValue({
            customFieldConditions: [customFieldCondition],
            isLoading: false,
            isError: false,
        })
        useDebouncedValueMock.mockReturnValue('foo')

        render(<ConditionalFields />)
        await userEvent.type(
            screen.getByPlaceholderText('Search condition...'),
            'foo',
        )
        await waitFor(() => {
            expect(useDebouncedValue).toHaveBeenLastCalledWith('foo', 300)
        })
        expect(screen.getByText(/No results found./)).toBeInTheDocument()
    })

    it('should render an error message when the error is returned by useCustomFieldConditions hook', () => {
        useCustomFieldConditionsMock.mockReturnValue({
            customFieldConditions: [],
            isLoading: false,
            isError: true,
        })

        render(<ConditionalFields />)
        const createConditionButton = screen.findAllByRole('button', {
            name: 'Create Condition',
        })
        expect(createConditionButton).toMatchObject({})
        expect(
            screen.getByText(
                'Unexpected error happened when trying to load existing conditions. Please try again later.',
            ),
        ).toBeInTheDocument()
    })

    it.each([[[1, 2, 3]], [[4, 5, 6]], [[1, 1, 1]], [[9, 9, 9]]])(
        'should update conditions on drag and drop',
        (initialSort: number[]) => {
            useCustomFieldConditionsMock.mockReturnValue({
                customFieldConditions: Array.from({ length: 3 }, (_, i) => ({
                    ...customFieldCondition,
                    id: i + 1,
                    sort_order: initialSort[i],
                })),
                isLoading: false,
                isError: false,
            })

            renderWithStoreAndQueryClientProvider(
                <DndProvider backend={HTML5Backend}>
                    <ConditionalFields />
                </DndProvider>,
            )

            // Drag the last row to the first row
            const dragHandles = screen.getAllByText(/drag_indicator/i)
            const from = dragHandles[2]
            const dest = dragHandles[0]
            act(() => {
                fireEvent.dragStart(from)
                fireEvent.dragEnter(dest)
                fireEvent.dragOver(dest)
            })
            act(() => {
                fireEvent.drop(dest)
            })

            // The new order should have the last row at first
            expect(updateConditions).toHaveBeenCalledWith({
                data: [
                    { id: 3, sort_order: 1 },
                    { id: 1, sort_order: 2 },
                    { id: 2, sort_order: 3 },
                ],
            })
        },
    )
})
