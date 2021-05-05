import React from 'react'
import {fireEvent, render, findByTestId, waitFor} from '@testing-library/react'
import {Connection} from 'twilio-client'
import {act} from 'react-hooks-testing-library'

import {mockIncomingConnection} from '../../../../../../../tests/twilioMocks'
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
        const connection = mockIncomingConnection() as Connection

        const {findByTestId} = render(<DialPad connection={connection} />)

        await waitFor(() => findByTestId('dial-pad-button'))
        expect(document.body.children).toMatchSnapshot()
    })

    it('should render as open', async () => {
        const connection = mockIncomingConnection() as Connection

        const {getByTestId} = render(<DialPad connection={connection} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => findByTestId(document.body, 'digit-1'))
        expect(document.body.children).toMatchSnapshot()
    })

    it(`should render as open when 10 digits have been pressed`, async () => {
        const connection = mockIncomingConnection() as Connection

        const {getByTestId} = render(<DialPad connection={connection} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        await waitFor(() => findByTestId(document.body, 'digit-1'))

        for (let digit = 0; digit < 10; digit++) {
            act(() => {
                fireEvent.click(getByTestId(`digit-${digit}`))
            })
        }

        expect(document.body.children).toMatchSnapshot()
    })

    it(`should render as open when 11 digits have been pressed`, async () => {
        const connection = mockIncomingConnection() as Connection

        const {getByTestId} = render(<DialPad connection={connection} />)

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
        const connection = mockIncomingConnection() as Connection

        const {getByTestId} = render(<DialPad connection={connection} />)

        act(() => {
            fireEvent.click(getByTestId('dial-pad-button'))
        })

        const digitTestId = `digit-${digit}`
        await waitFor(() => findByTestId(document.body, digitTestId))

        act(() => {
            fireEvent.click(getByTestId(digitTestId))
        })

        expect(connection.sendDigits).toHaveBeenCalledWith(digit)
    })
})
