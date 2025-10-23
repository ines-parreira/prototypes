import React from 'react'

import { userEvent } from '@repo/testing'
import { useShortcuts } from '@repo/utils'
import { render } from '@testing-library/react'
import _noop from 'lodash/noop'
import { Moment } from 'moment'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'

import Snooze from '../Snooze'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    useShortcuts: jest.fn(),
}))
jest.mock('common/segment')
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

    it('should show a tooltip when hovering the button', async () => {
        const { findByText, getByText, queryByText } = render(
            <Snooze onUpdate={_noop} />,
        )

        const tip = queryByText('Snooze ticket')
        expect(tip).not.toBeInTheDocument()

        const button = getByText('snooze')
        userEvent.hover(button)
        expect(await findByText('Snooze ticket')).toBeInTheDocument()
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

    it('should show the snooze picker when not currently snoozed', () => {
        const { getByText } = render(<Snooze onUpdate={_noop} />)

        const el = getByText('snooze')
        expect(el).toBeInTheDocument()
        expect(getByText('TicketSnoozePicker closed')).toBeInTheDocument()

        userEvent.click(el)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.SnoozeButtonClicked,
            { isSnoozed: false },
        )
        expect(getByText('TicketSnoozePicker open')).toBeInTheDocument()
    })

    it('should update the snooze time', () => {
        const onUpdate = jest.fn()
        const { getByText } = render(
            <Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />,
        )

        const snoozeEl = getByText('snooze')
        userEvent.click(snoozeEl)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.SnoozeButtonClicked,
            { isSnoozed: true },
        )

        expect(getByText('Change snooze time')).toBeInTheDocument()
        userEvent.click(getByText('update snooze time'))
        expect(onUpdate).toHaveBeenCalled()
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (onUpdate.mock.calls[0][0] as Moment).format('YYYY-MM-DD'),
        ).toEqual('2024-01-01')
    })

    it('should clear the snooze time', () => {
        const onUpdate = jest.fn()
        const { getByText } = render(
            <Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />,
        )

        const snoozeEl = getByText('snooze')
        userEvent.click(snoozeEl)

        const clearEl = getByText('Clear snooze')
        expect(clearEl).toBeInTheDocument()
        userEvent.click(clearEl)
        expect(onUpdate).toHaveBeenCalledWith(null)
    })
})
