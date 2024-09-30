import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useParams} from 'react-router-dom'

import {assumeMock} from 'utils/testing'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'
import {ticketInputFieldDefinition} from 'fixtures/customField'
import useDebouncedValue from 'hooks/useDebouncedValue'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {useUpdateCustomFieldDefinitions} from 'hooks/customField/useUpdateCustomFieldDefinitions'
import {OBJECT_TYPES, OBJECT_TYPE_SETTINGS} from 'models/customField/constants'

import CustomFields from '../CustomFields'

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
        return <div data-testid="custom-fields-list"></div>
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

describe('<CustomFields/>', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({activeTab: 'active'})
        useDebouncedValueMock.mockReturnValue('')
        useCustomFieldDefinitionsMock.mockReturnValue(emptyFieldDefinitions)
        useUpdateCustomFieldDefinitionsMock.mockReturnValue({
            mutate: jest.fn(),
        } as unknown as ReturnType<typeof useUpdateCustomFieldDefinitions>)
    })

    it('should render get started', () => {
        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(screen.getByText(/Get started with Ticket Fields/)).toBeDefined()
        expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it('should render no active ticket fields when there is at least one archived ticket field', () => {
        useCustomFieldDefinitionsMock.mockImplementation(({archived}) => {
            if (archived) {
                return notEmptyFieldDefinitions
            }
            return emptyFieldDefinitions
        })

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(
            screen.getByText(
                /You don't have any active ticket fields at the moment/
            )
        ).toBeDefined()
        expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it('should render active ticket fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue(notEmptyFieldDefinitions)

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(screen.getByTestId('custom-fields-list')).toBeInTheDocument()
    })

    it('should render no results found', async () => {
        useDebouncedValueMock.mockReturnValue('foo')

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)
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

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(
            screen.getByText(
                /You don't have any archived ticket fields at the moment/
            )
        ).toBeDefined()
        expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it('should render archived ticket fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue(notEmptyFieldDefinitions)
        useParamsMock.mockReturnValue({activeTab: 'archived'})

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(screen.getByTestId('custom-fields-list')).toBeInTheDocument()
    })

    it.each([[OBJECT_TYPES.TICKET], [OBJECT_TYPES.CUSTOMER]])(
        'should disable the create button when max limit is reached and display an alert',
        (objectType) => {
            useCustomFieldDefinitionsMock.mockReturnValue({
                data: apiListCursorPaginationResponse(
                    Array.from(
                        {length: OBJECT_TYPE_SETTINGS[objectType].MAX_FIELDS},
                        () => ticketInputFieldDefinition
                    )
                ),
                isLoading: false,
            } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

            render(<CustomFields objectType={objectType} />)

            expect(
                screen.getByText(/Please archive some fields before creating/)
            ).toBeDefined()
            expect(
                screen.getByRole('button', {name: 'Create Field'})
            ).toBeAriaDisabled()
        }
    )
})
