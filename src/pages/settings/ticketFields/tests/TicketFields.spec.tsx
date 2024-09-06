import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useParams} from 'react-router-dom'

import {assumeMock} from 'utils/testing'
import {ticketInputFieldDefinition} from 'fixtures/customField'
import useDebouncedValue from 'hooks/useDebouncedValue'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {useUpdateCustomFieldDefinitions} from 'hooks/customField/useUpdateCustomFieldDefinitions'

import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import TicketFields from '../TicketFields'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useParams: jest.fn(),
            Link: ({children}: {children: React.ReactNode}) => children,
            NavLink: ({children}: {children: React.ReactNode}) => children,
        } as Record<string, unknown>)
)
jest.mock('hooks/customField/useCustomFieldDefinitions')
jest.mock('hooks/customField/useUpdateCustomFieldDefinitions')
jest.mock('hooks/useDebouncedValue')
jest.mock('../components/List', () =>
    jest.fn(() => {
        return <div data-testid="ticket-fields-list"></div>
    })
)

const useParamsMock = assumeMock(useParams)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useUpdateCustomFieldDefinitionsMock = assumeMock(
    useUpdateCustomFieldDefinitions
)
const useDebouncedValueMock = assumeMock(useDebouncedValue)

const emptyFieldDefinitions = {
    isLoading: false,
    data: apiListCursorPaginationResponse([]),
} as unknown as ReturnType<typeof useCustomFieldDefinitions>

const notEmptyFieldDefinitions = {
    data: apiListCursorPaginationResponse([ticketInputFieldDefinition]),
    isLoading: false,
} as unknown as ReturnType<typeof useCustomFieldDefinitions>

describe('<TicketFields/>', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({activeTab: 'active'})
        useDebouncedValueMock.mockReturnValue('')
        useCustomFieldDefinitionsMock.mockReturnValue(emptyFieldDefinitions)
        useUpdateCustomFieldDefinitionsMock.mockReturnValue({
            mutate: jest.fn(),
        } as unknown as ReturnType<typeof useUpdateCustomFieldDefinitions>)
    })

    it('should render get started', () => {
        render(<TicketFields />)

        expect(screen.getByText(/Get started with Ticket Fields/)).toBeDefined()
        expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
    })

    it('should render no active ticket fields when there is at least one archived ticket field', () => {
        useCustomFieldDefinitionsMock.mockImplementation(({archived}) => {
            if (archived) {
                return notEmptyFieldDefinitions
            }
            return emptyFieldDefinitions
        })

        render(<TicketFields />)

        expect(
            screen.getByText(
                /You don't have any active ticket fields at the moment/
            )
        ).toBeDefined()
        expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
    })

    it('should render active ticket fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue(notEmptyFieldDefinitions)

        render(<TicketFields />)

        expect(screen.getByTestId('ticket-fields-list')).toBeInTheDocument()
    })

    it('should render no results found', async () => {
        useDebouncedValueMock.mockReturnValue('foo')

        render(<TicketFields />)
        await userEvent.type(
            screen.getByPlaceholderText('Search ticket fields...'),
            'foo'
        )
        await waitFor(() => {
            expect(useDebouncedValue).toHaveBeenLastCalledWith('foo', 300)
        })
        expect(screen.getByText(/No results found./)).toBeInTheDocument()
    })

    it('should render no archived ticket fields', () => {
        useCustomFieldDefinitionsMock.mockImplementation(({archived}) => {
            if (!archived) {
                return notEmptyFieldDefinitions
            }
            return emptyFieldDefinitions
        })
        useParamsMock.mockReturnValue({activeTab: 'archived'})

        render(<TicketFields />)

        expect(
            screen.getByText(
                /You don't have any archived ticket fields at the moment/
            )
        ).toBeDefined()
        expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
    })

    it('should render archived ticket fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue(notEmptyFieldDefinitions)
        useParamsMock.mockReturnValue({activeTab: 'archived'})

        render(<TicketFields />)

        expect(screen.getByTestId('ticket-fields-list')).toBeInTheDocument()
    })
})
