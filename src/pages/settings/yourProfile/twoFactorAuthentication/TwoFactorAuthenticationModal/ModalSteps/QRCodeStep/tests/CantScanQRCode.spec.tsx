import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {authenticatorData} from 'fixtures/authenticatorData'
import CantScanQRCode from '../CantScanQRCode'

describe('<CantScanQRCode />', () => {
    describe('render()', () => {
        it('should render the component with extra hidden', () => {
            const {container} = render(
                <CantScanQRCode authenticatorData={authenticatorData} />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render the component with extra shown', async () => {
            const {container, findByText, findAllByRole} = render(
                <CantScanQRCode authenticatorData={authenticatorData} />
            )

            const clickableText = await findByText("Can't scan the QR code?")
            fireEvent.click(clickableText)

            expect((await findAllByRole('textbox')).length).toBe(3)

            expect(container).toMatchSnapshot()
        })
    })
})
