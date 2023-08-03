import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'
import {Moment} from 'moment'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import Snooze from '../Snooze'

jest.mock('hooks/useAppSelector', () => jest.fn())
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
        }
)

const useAppSelectorMock = useAppSelector as jest.Mock

describe('Snooze', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue('Europe/Amsterdam')
    })

    it('should show the snooze picker when not currently snoozed', () => {
        const {getByText} = render(<Snooze onUpdate={_noop} />)

        const el = getByText('snooze')
        expect(el).toBeInTheDocument()
        expect(getByText('TicketSnoozePicker closed')).toBeInTheDocument()

        userEvent.click(el)
        expect(getByText('TicketSnoozePicker open')).toBeInTheDocument()
    })

    it('should update the snooze time', () => {
        const onUpdate = jest.fn()
        const {getByText} = render(
            <Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />
        )

        expect(getByText('Change snooze time')).toBeInTheDocument()
        userEvent.click(getByText('update snooze time'))
        expect(onUpdate).toHaveBeenCalled()
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (onUpdate.mock.calls[0][0] as Moment).format('YYYY-MM-DD')
        ).toEqual('2024-01-01')
    })

    it('should clear the snooze time', () => {
        const onUpdate = jest.fn()
        const {getByText} = render(
            <Snooze until="2024-01-01T00:00:00" onUpdate={onUpdate} />
        )

        const el = getByText('Clear snooze')
        expect(el).toBeInTheDocument()
        userEvent.click(el)
        expect(onUpdate).toHaveBeenCalledWith(null)
    })
})
