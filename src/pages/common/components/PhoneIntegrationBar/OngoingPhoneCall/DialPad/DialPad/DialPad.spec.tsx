import React from 'react'
import {fireEvent, render, findByTestId, waitFor} from '@testing-library/react'
import {Call} from '@twilio/voice-sdk'
import {act} from '@testing-library/react-hooks'

import {mockIncomingCall} from '../../../../../../../tests/twilioMocks'
import DialPad from '../DialPad'

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

describe('<DialPad/>', () => {
    it('should render as closed', async () => {
        const call = mockIncomingCall() as Call

        const {findByTestId, queryByTestId} = render(<DialPad call={call} />)

        await waitFor(() => findByTestId('dial-pad-button'))
        expect(queryByTestId('digit-1')).toBeNull()
    })

    it('should render as open', async () => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<DialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => expect(getByTestId('digit-1')).toBeInTheDocument())
    })

    it(`should render as open when 10 digits have been pressed`, async () => {
        const call = mockIncomingCall() as Call

        const {getByTestId, findByTestId} = render(<DialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => findByTestId('digit-1'))

        for (let digit = 0; digit < 10; digit++) {
            act(() => {
                fireEvent.click(getByTestId(`digit-${digit}`))
            })
        }

        expect(document.body.children).toMatchSnapshot()
    })

    it(`should render as open when 11 digits have been pressed`, async () => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<DialPad call={call} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => findByTestId(document.body, 'digit-1'))

        for (let digit = 0; digit < 10; digit++) {
            act(() => {
                fireEvent.click(getByTestId(`digit-${digit}`))
            })
        }

        fireEvent.click(getByTestId('digit-#'))

        expect(document.body.children).toMatchSnapshot()
    })

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
    it.each(digits)('should send clicked digit', async (digit) => {
        const call = mockIncomingCall() as Call

        const {getByTestId} = render(<DialPad call={call} />)

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
})
