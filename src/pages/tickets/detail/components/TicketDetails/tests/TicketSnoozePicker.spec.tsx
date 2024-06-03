import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'

import TicketSnoozePicker from 'pages/tickets/detail/components/TicketDetails/TicketSnoozePicker'
import DatePicker from 'pages/common/forms/DatePicker'
import {FeatureFlagKey} from 'config/featureFlags'

const errorSpy = jest.spyOn(global.console, 'error')
const mockStore = configureMockStore([thunk])()

jest.mock(
    'pages/common/forms/DatePicker',
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewTicketSnoozeAndTicketDate]: false,
        }))
    })

    afterEach(() => {
        ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
    })

    describe('rendering', () => {
        it('should not render the datepicker when closed', () => {
            const {container} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker {...minProps} datetime="2018-10-26" />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render the provided value', () => {
            const {baseElement} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker
                        {...minProps}
                        datetime="2018-10-26T12:33"
                        isOpen={true}
                    />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render the default datetime value', () => {
            const {baseElement} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker {...minProps} isOpen={true} />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).not.toHaveBeenCalledWith(
                /Received invalid datetime/
            )
        })

        it('should render a DatePicker and log error when datetime has a wrong format', () => {
            const datetime = 'foo'
            const {baseElement} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker
                        {...minProps}
                        isOpen={true}
                        datetime={datetime}
                    />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
            expect(errorSpy).toHaveBeenCalledWith(
                'Received invalid datetime',
                datetime
            )
        })

        it('should render with old style DatePicker props when NewTicketSnoozeAndTicketDate flag is disabled', () => {
            const {container} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker {...minProps} datetime="2018-10-26" />
                </Provider>
            )

            const datePickerPropsShouldContain = [
                'pickerV2Styles: false',
                'rangesOnLeft: false',
                'showRangesLabel: true',
                'actionButtonsOnTheBottom: false',
                'changeButtonColorsToV2: false',
            ]
            const datePickerProps =
                container.querySelector('.DatePicker')?.textContent

            const result = datePickerPropsShouldContain.every((prop) => {
                return datePickerProps?.includes(prop)
            })

            expect(result).toBe(true)
        })

        it('should render with new style DatePicker props when NewTicketSnoozeAndTicketDate flag is disabled', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.NewTicketSnoozeAndTicketDate]: true,
            }))
            const {container} = render(
                <Provider store={mockStore}>
                    <TicketSnoozePicker {...minProps} datetime="2018-10-26" />
                </Provider>
            )

            const datePickerPropsShouldContain = [
                'pickerV2Styles: true',
                'rangesOnLeft: true',
                'showRangesLabel: false',
                'actionButtonsOnTheBottom: true',
                'changeButtonColorsToV2: true',
                `"applyButtonClasses":"btn-primary"`,
            ]
            const datePickerProps =
                container.querySelector('.DatePicker')?.textContent

            const result = datePickerPropsShouldContain.every((prop) => {
                return datePickerProps?.includes(prop)
            })

            expect(result).toBe(true)
        })
    })
})
