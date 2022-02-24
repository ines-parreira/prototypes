import React from 'react'
import {render} from '@testing-library/react'
import {authenticatorData} from '../../../../../../../../fixtures/authenticatorData'
import {fetchAuthenticatorData} from '../../../../../../../../models/twoFactorAuthentication/resources'
import QRCodeStep from '../QRCodeStep'

jest.mock('../CantScanQRCode', () => () => <div>Can't scan QR code mocked</div>)

jest.mock('models/twoFactorAuthentication/resources')
const fetchAuthenticatorDataMock =
    fetchAuthenticatorData as jest.MockedFunction<typeof fetchAuthenticatorData>

describe('<QRCodeStep />', () => {
    describe('render()', () => {
        it('should render the component with the loading component', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {container, findByText} = render(
                <QRCodeStep errorText={''} setErrorText={jest.fn()} />
            )

            await findByText('QR code is loading. Please wait.')

            expect(container).toMatchSnapshot()
        })

        it('should render the component with the qr code', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {container, findByAltText} = render(
                <QRCodeStep errorText={''} setErrorText={jest.fn()} />
            )

            // Wait for the qrcode library to render the image
            await findByAltText('The QR Code to scan')

            expect(container).toMatchSnapshot()
        })

        it('should render the component without the qrcode container', () => {
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const {container} = render(
                <QRCodeStep
                    errorText={'foo error banner'}
                    setErrorText={jest.fn()}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
