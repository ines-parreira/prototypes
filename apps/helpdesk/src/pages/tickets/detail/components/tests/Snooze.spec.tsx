import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { useShortcuts } from '@repo/utils'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'
import type { Moment } from 'moment'

import useAppSelector from 'hooks/useAppSelector'

import Snooze from '../Snooze'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    useShortcuts: jest.fn(),
}))
jest.mock('@repo/logging')
jest.mock(
    '../TicketDetails/TicketSnoozePicker',
    () =>
        ({
            isOpen,
            onSubmit,
        }: {
            isOpen: boolean
            onSubmit: (until: Moment | null) => void
        }) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const moment = require('moment')
            const handleClick = () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                onSubmit(moment('2024-01-01T00:00:00'))
            }
            return (
                <div>
                    <p>TicketSnoozePicker {isOpen ? 'open' : 'closed'}</p>
                    <button type="button" onClick={handleClick}>
                        update snooze time
                    </button>
                </div>
            )
        },
)

const useAppSelectorMock = useAppSelector as jest.Mock
const useShortcutsMock = useShortcuts as jest.Mock

describe('Snooze', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.restoreAllMocks()

        useAppSelectorMock.mockReturnValue('Europe/Amsterdam')
    })

    it('should render the snooze button', () => {
        render(<Snooze onUpdate={_noop} />)

        expect(
            screen.getByRole('button', { name: 'Snooze' }),
        ).toBeInTheDocument()
    })

    it('should bind keyboard shortcuts', () => {
        render(<Snooze onUpdate={_noop} />)
        expect(useShortcutsMock).toHaveBeenCalledWith('TicketDetailContainer', {
            OPEN_SNOOZE_TICKET: {
                action: expect.any(Function),
            },
            CLOSE_SNOOZE_TICKET: {
                key: 'esc',
                action: expect.any(Function),
            },
        })
    })

    it('should show the snooze picker when not currently snoozed', async () => {
        const user = userEvent.setup({ skipHover: true })
        render(<Snooze onUpdate={_noop} />)

        const button = screen.getByRole('button', { name: 'Snooze' })

        expect(button).toBeInTheDocument()
        expect(
            screen.getByText('TicketSnoozePicker closed'),
        ).toBeInTheDocument()

        await act(async () => {
            await user.click(button)
        })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.SnoozeButtonClicked,
            { isSnoozed: false },
        )
        expect(screen.getByText('TicketSnoozePicker open')).toBeInTheDocument()
    })

    it('should update the snooze time', async () => {
        const user = userEvent.setup({ skipHover: true })
        const onUpdate = jest.fn()
        render(<Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />)

        const button = screen.getByRole('button', { name: 'Snooze' })

        await act(async () => {
            await user.click(button)
        })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.SnoozeButtonClicked,
            { isSnoozed: true },
        )

        expect(screen.getByText('Change snooze time')).toBeInTheDocument()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /update snooze time/i }),
            )
        })

        expect(onUpdate).toHaveBeenCalled()
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (onUpdate.mock.calls[0][0] as Moment).format('YYYY-MM-DD'),
        ).toEqual('2024-01-01')
    })

    it('should clear the snooze time', async () => {
        const user = userEvent.setup({ skipHover: true })
        const onUpdate = jest.fn()
        render(<Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />)

        const button = screen.getByRole('button', { name: 'Snooze' })

        await act(async () => {
            await user.click(button)
        })

        const clearEl = screen.getByText('Clear snooze')
        expect(clearEl).toBeInTheDocument()

        await act(async () => {
            await user.click(clearEl)
        })

        expect(onUpdate).toHaveBeenCalledWith(null)
    })

    it('should show the standalone tooltip message when disabled', async () => {
        const user = userEvent.setup()
        render(<Snooze disabled onUpdate={_noop} />)

        const button = screen.getByRole('button', { name: 'Snooze' })

        expect(button).toBeDisabled()

        await act(async () => {
            await user.hover(button)
        })

        expect(
            await screen.findByText('Not available in standalone mode'),
        ).toBeInTheDocument()
        expect(logEvent).not.toHaveBeenCalled()
        expect(
            screen.getByText('TicketSnoozePicker closed'),
        ).toBeInTheDocument()
    })
})
