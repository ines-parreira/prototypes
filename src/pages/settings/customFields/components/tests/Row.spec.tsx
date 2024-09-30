import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {
    aiManagedTicketInputFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {useUpdateCustomFieldArchiveStatus} from 'hooks/customField/useUpdateCustomFieldArchiveStatus'
import {TableBodyRowDraggable} from 'pages/common/components/table/TableBodyRowDraggable'
import {assumeMock} from 'utils/testing'

import Row from '../Row'

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) =>
            <div data-testid="DatetimeLabel">{dateTime}</div>
)

jest.mock('models/customField/resources')
jest.mock('hooks/customField/useUpdateCustomFieldArchiveStatus')
jest.mock('pages/common/components/table/TableBodyRowDraggable')

const useUpdateCustomFieldArchiveStatusMock = assumeMock(
    useUpdateCustomFieldArchiveStatus
)
const TableBodyRowDraggableMock = assumeMock(TableBodyRowDraggable)

const updateMutateMock = jest.fn()

const defaultProps = {
    customField: ticketInputFieldDefinition,
    canReorder: true,
    position: 0,
    onMoveEntity: jest.fn(),
    onDropEntity: jest.fn(),
}

describe('<Row />', () => {
    beforeEach(() => {
        TableBodyRowDraggableMock.mockImplementation(({children}) => (
            <tr>{children}</tr>
        ))
        useUpdateCustomFieldArchiveStatusMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
                isLoading: false,
            } as unknown as ReturnType<typeof useUpdateCustomFieldArchiveStatus>
        })
    })

    it.each([true, false])(
        'should pass correct props to TableBodyRowDraggable',
        (canReorder) => {
            const props = {
                ...defaultProps,
                canReorder,
            }

            render(
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            )

            expect(TableBodyRowDraggableMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    shouldRenderDragHandle: canReorder,
                    onMoveEntity: props.onMoveEntity,
                    onDropEntity: props.onDropEntity,
                    dragItem: {
                        id: ticketInputFieldDefinition.id,
                        position: props.position,
                        type: 'custom-fields-row',
                    },
                }),
                {}
            )
        }
    )

    it('should render correctly the required badge', () => {
        const props = {
            ...defaultProps,
            customField: {
                ...ticketInputFieldDefinition,
                required: true,
            },
        }

        render(
            <table>
                <tbody>
                    <Row {...props} />
                </tbody>
            </table>
        )
        expect(screen.getByText('REQUIRED')).toBeInTheDocument()
    })

    it('should show a tooltip on AI managed fields', async () => {
        const props = {
            ...defaultProps,
            customField: aiManagedTicketInputFieldDefinition,
        }

        render(
            <table>
                <tbody>
                    <Row {...props} />
                </tbody>
            </table>
        )

        userEvent.hover(screen.getByText('info'))
        await waitFor(() => {
            expect(
                screen.getByText(/is a Gorgias AI managed/)
            ).toBeInTheDocument()
        })
    })

    it.each([ticketInputFieldDefinition, aiManagedTicketInputFieldDefinition])(
        'should render correctly AI Agent managed field',
        (ticketFieldDefinition) => {
            const props = {
                ...defaultProps,
                customField: {
                    ...ticketFieldDefinition,
                    deactivated_datetime: null,
                },
            }

            const {queryByTitle} = render(
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            )

            ticketFieldDefinition.managed_type === 'ai_intent'
                ? expect(queryByTitle('Archive')).toHaveAttribute(
                      'aria-disabled',
                      'true'
                  )
                : expect(queryByTitle('Archive')).toBeInTheDocument()
        }
    )

    it.each([ticketInputFieldDefinition, aiManagedTicketInputFieldDefinition])(
        'should render correctly AI Agent managed field when archived',
        (ticketFieldDefinition) => {
            const props = {
                ...defaultProps,
                customField: {
                    ...ticketFieldDefinition,
                    deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
                },
            }

            const {queryByTitle} = render(
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            )

            expect(queryByTitle('Archive')).not.toBeInTheDocument()
            ticketFieldDefinition.managed_type === 'ai_intent'
                ? expect(queryByTitle('Unarchive')).toHaveAttribute(
                      'aria-disabled',
                      'true'
                  )
                : expect(queryByTitle('Unarchive')).toBeInTheDocument()
        }
    )

    it('should archive correctly', async () => {
        const props = {
            ...defaultProps,
            customField: {
                ...ticketInputFieldDefinition,
                deactivated_datetime: null,
            },
        }

        const {findByTitle, findByText} = render(
            <table>
                <tbody>
                    <Row {...props} />
                </tbody>
            </table>
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

        expect(useUpdateCustomFieldArchiveStatusMock).toHaveBeenCalledWith(
            ticketInputFieldDefinition.id
        )
        expect(updateMutateMock).toHaveBeenCalledWith(true)
    })

    it('should unarchive correctly', async () => {
        const props = {
            ...defaultProps,
            customField: {
                ...ticketInputFieldDefinition,
                deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
            },
        }

        const {findByTitle} = render(
            <table>
                <tbody>
                    <Row {...props} />
                </tbody>
            </table>
        )
        expect(screen.queryByLabelText('Archive')).not.toBeInTheDocument()
        expect(screen.getByTitle('Unarchive'))

        const unArchiveModalButton = await findByTitle('Unarchive')
        unArchiveModalButton.click() // there is no modal

        expect(useUpdateCustomFieldArchiveStatusMock).toHaveBeenCalledWith(
            ticketInputFieldDefinition.id
        )
        await waitFor(
            () => {
                expect(updateMutateMock).toHaveBeenCalledWith(false)
            },
            {interval: 500}
        )
    })
})
