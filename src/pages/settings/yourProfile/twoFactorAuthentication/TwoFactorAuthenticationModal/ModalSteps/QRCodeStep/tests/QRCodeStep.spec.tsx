import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {authenticatorData} from '../../../../../../../../fixtures/authenticatorData'
import QRCodeStep from '../QRCodeStep'
import {AuthenticatorData} from '../../../../../../../../models/twoFactorAuthentication/types'

jest.mock('../CantScanQRCode', () => () => <div>Can't scan QR code mocked</div>)

describe('<QRCodeStep />', () => {
    describe('render()', () => {
        const waitForLoadingToEnd = async () => {
            await waitFor(() => {
                expect(() =>
                    screen.queryByText('QR code is loading. Please wait.')
                ).toHaveLength(0)
            })

            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })
        }

        it('should render the component with the loading component', async () => {
            const {container} = render(
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    errorText={''}
                    setErrorText={jest.fn()}
                    setIsLoading={jest.fn()}
                />
            )

            await screen.findByText('QR code is loading. Please wait.')

            expect(container).toMatchSnapshot()
        })

        it('should render the component with the qr code', async () => {
            const {container} = render(
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    errorText={''}
                    setErrorText={jest.fn()}
                    setIsLoading={jest.fn()}
                />
            )

            await waitForLoadingToEnd()

            // Wait for the qrcode library to render the image
            await screen.findByAltText('The QR Code to scan')

            expect(container).toMatchSnapshot()
        })

        it('should render the component without the qrcode container', async () => {
            const {container} = render(
                <QRCodeStep
                    authenticatorData={{} as AuthenticatorData}
                    errorText={'foo error banner'}
                    setErrorText={jest.fn()}
                    setIsLoading={jest.fn()}
                />
            )

            await waitForLoadingToEnd()

            expect(container).toMatchSnapshot()
        })
    })
})
