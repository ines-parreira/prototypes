import {render} from '@testing-library/react'
import React from 'react'

import TicketSnoozePicker from '../TicketSnoozePicker'
import DatePicker from '../../../../../common/forms/DatePicker'

const errorSpy = jest.spyOn(global.console, 'error')

jest.mock(
    '../../../../../common/forms/DatePicker',
    () => (props: React.ComponentProps<typeof DatePicker>) =>
        (
            <div className="DatePicker">
                {Object.entries(props).map(
                    ([key, value]) => `${key}: ${JSON.stringify(value)}`
                )}
            </div>
        )
)

describe('<TicketSnoozePicker/>', () => {
    const minProps = {
        timezone: 'US/Pacific',
        isOpen: false,
        onSubmit: jest.fn(),
        toggle: jest.fn(),
    }

    beforeEach(() => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1513950737000)
    })

    afterEach(() => {
        jest.clearAllMocks()
        ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
    })

    describe('rendering', () => {
        it('should not render the datepicker when closed', () => {
            const {container} = render(
                <TicketSnoozePicker {...minProps} datetime="2018-10-26" />
            )

            expect(container.firstChild).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render the provided value', () => {
            const {baseElement} = render(
                <TicketSnoozePicker
                    {...minProps}
                    datetime="2018-10-26T12:33"
                    isOpen={true}
                />
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render the default datetime value', () => {
            const {baseElement} = render(
                <TicketSnoozePicker {...minProps} isOpen={true} />
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render a DatePicker and log error when datetime has a wrong format', () => {
            const datetime = 'foo'
            const {baseElement} = render(
                <TicketSnoozePicker
                    {...minProps}
                    isOpen={true}
                    datetime={datetime}
                />
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).toHaveBeenCalledWith(
                'Received invalid datetime',
                datetime
            )
        })
    })
})
