import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'

import {screen, waitFor} from '@testing-library/react'
import {
    aiManagedTicketInputFieldDefinition,
    archivedTicketInputFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithDnD} from 'utils/testing'
import Row from '../Row'
import {useUpdatePartialCustomField} from '../../../../../models/customField/queries'

const mockStore = configureMockStore([thunk])

jest.mock('models/customField/queries')
const useUpdatePartialCustomFieldMock = assumeMock(useUpdatePartialCustomField)
const updateMutateMock = jest.fn()

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) =>
            <div data-testid="DatetimeLabel">{dateTime}</div>
)

jest.mock('models/customField/resources')

const queryClient = mockQueryClient()

describe('<Row />', () => {
    beforeEach(() => {
        useUpdatePartialCustomFieldMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
                mutateAsync: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdatePartialCustomField>
        })
        jest.useFakeTimers().setSystemTime(42)
        queryClient.clear()
    })

    it.each([true, false])(
        'should render correctly active field',
        (canReorder) => {
            const props = {
                ticketField: ticketInputFieldDefinition,
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([true, false])(
        'should render correctly active required field',
        (canReorder) => {
            const props = {
                ticketField: {
                    ...ticketInputFieldDefinition,
                    required: true,
                },
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([true, false])(
        'should render correctly archived required field',
        (canReorder) => {
            const props = {
                ticketField: {
                    ...ticketInputFieldDefinition,
                    required: true,
                    deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
                },
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([ticketInputFieldDefinition, aiManagedTicketInputFieldDefinition])(
        'should render correctly AI Agent managed field',
        (ticketFieldDefinition) => {
            const props = {
                ticketField: {
                    ...ticketFieldDefinition,
                    required: true,
                    deactivated_datetime: null,
                },
                canReorder: true,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {queryByTitle, queryByText} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )

            ticketFieldDefinition.managed_type === 'ai_intent'
                ? expect(queryByTitle('Archive')).not.toBeInTheDocument()
                : expect(queryByTitle('Archive')).toBeInTheDocument()

            ticketFieldDefinition.managed_type === 'ai_intent'
                ? expect(queryByText('drag_indicator')).not.toBeInTheDocument()
                : expect(queryByText('drag_indicator')).toBeInTheDocument()

            const trElement: HTMLTableRowElement | null =
                ticketFieldDefinition.managed_type === 'ai_intent'
                    ? screen.getByText('Contact reason').closest('tr')
                    : screen.getByText('Input field').closest('tr')
            expect(trElement).not.toBeNull()
            expect(trElement!.childNodes).toHaveLength(5) // ensure the table always has 5 columns
        }
    )

    it.each([ticketInputFieldDefinition, aiManagedTicketInputFieldDefinition])(
        'should render correctly AI Agent managed field when archived',
        (ticketFieldDefinition) => {
            const props = {
                ticketField: {
                    ...ticketFieldDefinition,
                    required: true,
                    deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
                },
                canReorder: true,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {queryByTitle} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )

            expect(queryByTitle('Archive')).not.toBeInTheDocument()
            ticketFieldDefinition.managed_type === 'ai_intent'
                ? expect(queryByTitle('Unarchive')).not.toBeInTheDocument()
                : expect(queryByTitle('Unarchive')).toBeInTheDocument()
        }
    )

    it('should archive correctly', async () => {
        const props = {
            ticketField: {
                ...ticketInputFieldDefinition,
                required: true,
                deactivated_datetime: null,
            },
            canReorder: true,
            position: 0,
            onMoveEntity: jest.fn(),
            onDropEntity: jest.fn(),
        }

        const {findByTitle, findByText} = renderWithDnD(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <table>
                        <tbody>
                            <Row {...props} />
                        </tbody>
                    </table>
                </Provider>
            </QueryClientProvider>
        )

        expect(screen.getByTitle('Archive'))
        expect(screen.queryByTitle('Unarchive')).not.toBeInTheDocument()

        const archiveModalButton = await findByTitle('Archive')
        archiveModalButton.click()
        expect(screen.getByText('Are you sure you want to archive this field?')) // ensure modal shows up

        const cancelButton = await findByText('Cancel')
        cancelButton.click()
        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Are you sure you want to archive this field?'
                )
            ).not.toBeInTheDocument()
        })

        archiveModalButton.click()
        const archiveButton = await findByText('Archive') // Button inside the modal
        archiveButton.click()
        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Are you sure you want to archive this field?'
                )
            ).not.toBeInTheDocument()
        })

        const expectedData = [
            ticketInputFieldDefinition.id,
            {deactivated_datetime: '1970-01-01T00:00:00.142Z'},
        ]

        expect(updateMutateMock).toHaveBeenNthCalledWith(1, expectedData)
    })

    it('should unarchived correctly', async () => {
        const props = {
            ticketField: {
                ...ticketInputFieldDefinition,
                required: true,
                deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
            },
            canReorder: true,
            position: 0,
            onMoveEntity: jest.fn(),
            onDropEntity: jest.fn(),
        }

        const {findByTitle} = renderWithDnD(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <table>
                        <tbody>
                            <Row {...props} />
                        </tbody>
                    </table>
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.queryByLabelText('Archive')).not.toBeInTheDocument()
        expect(screen.getByTitle('Unarchive'))

        const unArchiveModalButton = await findByTitle('Unarchive')
        unArchiveModalButton.click() // there is no modal

        const expectedData = [
            archivedTicketInputFieldDefinition.id,
            {deactivated_datetime: null},
        ]

        await waitFor(
            () => {
                expect(updateMutateMock).toHaveBeenNthCalledWith(
                    1,
                    expectedData
                )
            },
            {interval: 500}
        )
    })
})
