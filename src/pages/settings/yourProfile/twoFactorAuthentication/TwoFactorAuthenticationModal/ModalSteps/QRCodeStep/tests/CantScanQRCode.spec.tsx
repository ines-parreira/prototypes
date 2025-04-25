import { act, fireEvent, render, screen } from '@testing-library/react'

import { authenticatorData } from 'fixtures/authenticatorData'

import CantScanQRCode from '../CantScanQRCode'

describe('<CantScanQRCode />', () => {
    describe('render()', () => {
        it('should render the component with extra hidden', () => {
            render(<CantScanQRCode authenticatorData={authenticatorData} />)

            expect(
                screen.getByText("Can't scan the QR code?"),
            ).toBeInTheDocument()

            expect(
                screen.queryByRole('textbox', { name: /Secret Key/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('textbox', { name: /Account Name/ }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('textbox', { name: /URL/ }),
            ).not.toBeInTheDocument()
        })

        it('should render the component with extra shown', async () => {
            render(<CantScanQRCode authenticatorData={authenticatorData} />)

            act(() => {
                fireEvent.click(
                    screen.getByRole('button', {
                        name: "Can't scan the QR code?",
                    }),
                )
            })

            expect(
                screen.getByRole('textbox', { name: /Secret Key/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /Account Name/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /URL/ }),
            ).toBeInTheDocument()
        })
    })
})
