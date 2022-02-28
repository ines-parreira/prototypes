import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {authenticatorData} from '../../../../../../../../fixtures/authenticatorData'
import {fetchAuthenticatorData} from '../../../../../../../../models/twoFactorAuthentication/resources'
import QRCodeStep from '../QRCodeStep'

jest.mock('../CantScanQRCode', () => () => <div>Can't scan QR code mocked</div>)

jest.mock('models/twoFactorAuthentication/resources')
const fetchAuthenticatorDataMock =
    fetchAuthenticatorData as jest.MockedFunction<typeof fetchAuthenticatorData>

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
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {container} = render(
                <QRCodeStep
                    errorText={''}
                    setErrorText={jest.fn()}
                    setIsLoading={jest.fn()}
                />
            )

            await screen.findByText('QR code is loading. Please wait.')

            expect(container).toMatchSnapshot()
        })

        it('should render the component with the qr code', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {container} = render(
                <QRCodeStep
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
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const {container} = render(
                <QRCodeStep
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
