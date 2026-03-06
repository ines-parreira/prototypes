import * as React from 'react'

import { screen } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    mockCreateJobHandler,
    mockGetCurrentUserHandler,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TicketListActions } from '../TicketListActions'

const mockCurrentUser = mockGetCurrentUserHandler()
const mockCreateJob = mockCreateJobHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockCurrentUser.handler, mockCreateJob.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    viewId: 123,
    selectedTicketIds: new Set<number>(),
    hasSelectedAll: false,
    selectionCount: 0,
    onSelectAll: vi.fn(),
    onActionComplete: vi.fn(),
}

describe('TicketListActions', () => {
    describe('checkbox label and state', () => {
        it.each([
            {
                selectionCount: 0,
                hasSelectedAll: false,
                expectedLabel: 'Select all',
            },
            {
                selectionCount: 2,
                hasSelectedAll: false,
                expectedLabel: '2 selected',
            },
            {
                selectionCount: 0,
                hasSelectedAll: true,
                expectedLabel: 'All selected',
            },
        ])(
            'shows "$expectedLabel" when selectionCount=$selectionCount hasSelectedAll=$hasSelectedAll',
            ({ selectionCount, hasSelectedAll, expectedLabel }) => {
                render(
                    <TicketListActions
                        {...defaultProps}
                        selectionCount={selectionCount}
                        hasSelectedAll={hasSelectedAll}
                    />,
                )

                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
                expect(
                    screen.getByRole('checkbox', { name: expectedLabel }),
                ).toBeInTheDocument()
            },
        )
    })

    describe('action buttons disabled when nothing is selected', () => {
        it.each([{ name: /close tickets/i }, { name: /more actions/i }])(
            '"$name" button is disabled when nothing is selected',
            ({ name }) => {
                render(<TicketListActions {...defaultProps} />)

                expect(screen.getByRole('button', { name })).toBeDisabled()
            },
        )
    })

    it('enables action buttons when tickets are selected', () => {
        render(
            <TicketListActions
                {...defaultProps}
                selectionCount={2}
                selectedTicketIds={new Set([1, 2])}
            />,
        )

        expect(
            screen.getByRole('button', { name: /close tickets/i }),
        ).not.toBeDisabled()
        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).not.toBeDisabled()
    })

    it('calls onSelectAll(true) when the checkbox is clicked while nothing is selected', async () => {
        const onSelectAll = vi.fn()
        const { user } = render(
            <TicketListActions {...defaultProps} onSelectAll={onSelectAll} />,
        )

        await user.click(screen.getByRole('checkbox', { name: 'Select all' }))

        expect(onSelectAll).toHaveBeenCalledWith(true)
    })
})
