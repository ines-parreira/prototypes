import React from 'react'
import {fireEvent, render, findByTestId, waitFor} from '@testing-library/react'
import {Call} from '@twilio/voice-sdk'
import {act} from '@testing-library/react-hooks'

import {mockIncomingCall} from '../../../../../../../tests/twilioMocks'
import InCallDialPad from '../InCallDialPad'

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

jest.mock('popper.js', () => {
    const PopperJS = jest.requireActual('popper.js')

    return class {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        static placements = PopperJS.placements

        constructor() {
            return {
                destroy: () => null,
                scheduleUpdate: () => null,
            }
        }
    }
})

jest.mock(
    'pages/integrations/integration/components/phone/DialPad',
    () =>
        ({
            onDigitClick,
            onChange,
            value,
        }: {
            onDigitClick: (digit: string) => void
            onChange: (value: string) => void
            value: string
        }) => {
            return digits.map((digit) => (
                <div
                    key={digit}
                    data-testid={`digit-${digit}`}
                    onClick={() => {
                        onDigitClick(digit)
                        onChange(`${value}${digit}`)
                    }}
                />
            ))
        }
)

describe('<InCallDialPad/>', () => {
    it('should render as closed', async () => {
        const call = mockIncomingCall() as Call

        const {findByTestId, queryByTestId} = render(
            <InCallDialPad call={call} />
        )

        await waitFor(() => findByTestId('dial-pad-button'))
        expect(queryByTestId('digit-1')).toBeNull()
    })

    it('should render as open', async () => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => expect(getByTestId('digit-1')).toBeInTheDocument())
    })

    it.each(digits)('should send clicked digit', async (digit) => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        const digitTestId = `digit-${digit}`
        await waitFor(() => findByTestId(document.body, digitTestId))

        act(() => {
            fireEvent.click(getByTestId(digitTestId))
        })

        expect(call.sendDigits).toHaveBeenCalledWith(digit)
    })

    it('should format output when output is longer than max length', async () => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => expect(getByTestId('digit-1')).toBeInTheDocument())

        act(() => {
            const dialedDigits = [
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '0',
                '1',
                '2',
            ]
            dialedDigits.forEach((digit) => {
                fireEvent.click(getByTestId(`digit-${digit}`))
            })
        })

        await waitFor(() =>
            expect(getByTestId('output')).toHaveTextContent('...3456789012')
        )
    })
})
