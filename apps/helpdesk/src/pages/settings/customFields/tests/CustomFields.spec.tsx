import React from 'react'

import { assumeMock, getLastMockCall, userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { Link, useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    AI_MANAGED_TYPES,
    OBJECT_TYPE_SETTINGS,
    OBJECT_TYPES,
} from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useUpdateCustomFieldDefinitions } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinitions'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'
import useDebouncedValue from 'hooks/useDebouncedValue'

import CustomFields from '../CustomFields'

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
            useParams: jest.fn(),
            Link: jest.fn(
                ({ children }: { children: React.ReactNode }) => children,
            ),
            NavLink: ({ children }: { children: React.ReactNode }) => children,
        }) as Record<string, unknown>,
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldDefinitions')
jest.mock('hooks/useDebouncedValue')
jest.mock('../components/List', () =>
    jest.fn(() => {
        return <div data-testid="custom-fields-list"></div>
    }),
)

const useParamsMock = assumeMock(useParams)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useUpdateCustomFieldDefinitionsMock = assumeMock(
    useUpdateCustomFieldDefinitions,
)
const useDebouncedValueMock = assumeMock(useDebouncedValue)
const mockedLogEvent = assumeMock(logEvent)
const mockedLink = assumeMock(Link)

const emptyFieldDefinitions = {
    isLoading: false,
    data: apiListCursorPaginationResponse([]),
} as unknown as ReturnType<typeof useCustomFieldDefinitions>

const notEmptyFieldDefinitions = {
    data: apiListCursorPaginationResponse([ticketInputFieldDefinition]),
    isLoading: false,
} as unknown as ReturnType<typeof useCustomFieldDefinitions>

const archivedOnlyFieldDefinitions = {
    data: apiListCursorPaginationResponse([
        {
            ...ticketInputFieldDefinition,
            deactivated_datetime: '2021-01-01T00:00:00Z',
        },
    ]),
    isLoading: false,
} as unknown as ReturnType<typeof useCustomFieldDefinitions>

describe('<CustomFields/>', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({ activeTab: 'active' })
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

    it("should render a 'Create Field' button", () => {
        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        const createFieldButton = screen.getByRole('button', {
            name: 'Create Field',
        })
        expect(createFieldButton).toBeInTheDocument()
        getLastMockCall(mockedLink)[0].onClick?.(
            {} as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        )
        expect(mockedLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldCreateFieldClicked,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })

    it('should render no active ticket fields when there is at least one archived ticket field', () => {
        useCustomFieldDefinitionsMock.mockImplementation(({ archived }) => {
            if (archived) {
                return notEmptyFieldDefinitions
            }
            return emptyFieldDefinitions
        })

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(
            screen.getByText(
                /You don't have any active ticket fields at the moment/,
            ),
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
            'foo',
        )
        await waitFor(() => {
            expect(useDebouncedValue).toHaveBeenLastCalledWith('foo', 300)
        })
        expect(screen.getByText(/No results found./)).toBeInTheDocument()
    })

    it('should render no archived ticket fields', () => {
        useCustomFieldDefinitionsMock.mockImplementation(({ archived }) => {
            if (!archived) {
                return notEmptyFieldDefinitions
            }
            return emptyFieldDefinitions
        })
        useParamsMock.mockReturnValue({ activeTab: 'archived' })

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(
            screen.getByText(
                /You don't have any archived ticket fields at the moment/,
            ),
        ).toBeDefined()
        expect(screen.queryByTestId('custom-fields-list')).toBeNull()
    })

    it('should render archived ticket fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue(notEmptyFieldDefinitions)
        useParamsMock.mockReturnValue({ activeTab: 'archived' })

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(screen.getByTestId('custom-fields-list')).toBeInTheDocument()
    })

    it('should render archived ticket fields even when there is no active fields', () => {
        useDebouncedValueMock.mockReturnValue(ticketInputFieldDefinition.label)
        useCustomFieldDefinitionsMock.mockImplementation(({ archived }) => {
            if (archived) {
                return archivedOnlyFieldDefinitions
            }
            return emptyFieldDefinitions
        })

        useParamsMock.mockReturnValue({ activeTab: 'archived' })

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)

        expect(screen.queryByText('No results found.')).toBeNull()
    })

    it.each([[OBJECT_TYPES.TICKET], [OBJECT_TYPES.CUSTOMER]])(
        'should disable the create button when max limit is reached and display an alert',
        (objectType) => {
            useCustomFieldDefinitionsMock.mockReturnValue({
                data: apiListCursorPaginationResponse(
                    Array.from(
                        { length: OBJECT_TYPE_SETTINGS[objectType].MAX_FIELDS },
                        () => ticketInputFieldDefinition,
                    ),
                ),
                isLoading: false,
            } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

            render(<CustomFields objectType={objectType} />)

            expect(
                screen.getByText(/Please archive some fields before creating/),
            ).toBeDefined()
            expect(
                screen.getByRole('button', { name: 'Create Field' }),
            ).toBeAriaDisabled()
        },
    )

    it('should count only active and not internally managed custom fields', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: apiListCursorPaginationResponse([
                ...Array.from({ length: 23 }, (_, idx) => ({
                    ...ticketInputFieldDefinition,
                    id: idx,
                    label: `Field ${idx}`,
                })),
                {
                    ...ticketInputFieldDefinition,
                    id: 24,
                    label: 'Field 24',
                    managed_type: 'contact_reason',
                },
                {
                    ...ticketNumberFieldDefinition,
                    id: 25,
                    label: 'Field 25',
                    managed_type: AI_MANAGED_TYPES.AI_INTENT,
                },
                {
                    ...ticketNumberFieldDefinition,
                    id: 26,
                    label: 'Field 26',
                    managed_type: AI_MANAGED_TYPES.AI_OUTCOME,
                },
            ]),
            isLoading: false,
        } as unknown as ReturnType<typeof useCustomFieldDefinitions>)

        render(<CustomFields objectType={OBJECT_TYPES.TICKET} />)
        expect(
            screen.queryByText(/Please archive some fields before creating/),
        ).toBeNull()
        expect(
            screen.getByRole('button', { name: 'Create Field' }),
        ).toBeAriaEnabled()
    })
})
