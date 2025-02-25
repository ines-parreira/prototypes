import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import { Call } from '@twilio/voice-sdk'

import { mockIncomingCall } from 'tests/twilioMocks'

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
        },
)

describe('<InCallDialPad />', () => {
    it('should render as closed', async () => {
        const call = mockIncomingCall() as Call

        render(<InCallDialPad call={call} />)

        await waitFor(() => screen.getByLabelText('Phone dial pad'))

        expect(screen.queryByTestId('digit-1')).toBeNull()
    })

    it('should render as open', async () => {
        const call = mockIncomingCall() as Call

        render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(screen.getByLabelText('Phone dial pad'))
        })

        await waitFor(() =>
            expect(screen.getByTestId('digit-1')).toBeInTheDocument(),
        )
    })

    it.each(digits)('should send clicked digit', async (digit) => {
        const call = mockIncomingCall() as Call

        render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(screen.getByLabelText('Phone dial pad'))
        })

        const digitTestId = `digit-${digit}`
        await waitFor(() => screen.getByTestId(digitTestId))

        act(() => {
            fireEvent.click(screen.getByTestId(digitTestId))
        })

        expect(call.sendDigits).toHaveBeenCalledWith(digit)
    })

    it('should format output when output is longer than max length', async () => {
        const call = mockIncomingCall() as Call

        render(<InCallDialPad call={call} />)

        act(() => {
            fireEvent.click(screen.getByLabelText('Phone dial pad'))
        })

        await waitFor(() =>
            expect(screen.getByTestId('digit-1')).toBeInTheDocument(),
        )

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
                fireEvent.click(screen.getByTestId(`digit-${digit}`))
            })
        })

        await waitFor(() =>
            expect(screen.getByText('...3456789012')).toBeInTheDocument(),
        )
    })
})
