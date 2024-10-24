import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'common/flags'
import {authenticatorData} from 'fixtures/authenticatorData'
import {AuthenticatorData} from 'models/twoFactorAuthentication/types'

import QRCodeStep from '../QRCodeStep'

jest.mock('../CantScanQRCode', () => () => <div>Can't scan QR code mocked</div>)

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

describe('<QRCodeStep />', () => {
    const setErrorTextMock = jest.fn()
    const setVerificationCodeMock = jest.fn()
    const setPasswordMock = jest.fn()

    beforeAll(() => {
        useFlagMock.mockReturnValue(false)
    })

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
                    setErrorText={setErrorTextMock}
                    setVerificationCode={setVerificationCodeMock}
                    setUserPassword={setPasswordMock}
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
                    setErrorText={setErrorTextMock}
                    setVerificationCode={setVerificationCodeMock}
                    setUserPassword={setPasswordMock}
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
                    setErrorText={setErrorTextMock}
                    setVerificationCode={setVerificationCodeMock}
                    setUserPassword={setPasswordMock}
                    setIsLoading={jest.fn()}
                />
            )

            await waitForLoadingToEnd()

            expect(container).toMatchSnapshot()
        })

        it('should trigger actions on input change', () => {
            const {getByPlaceholderText} = render(
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    setVerificationCode={setVerificationCodeMock}
                    setUserPassword={setPasswordMock}
                    setErrorText={setErrorTextMock}
                    setIsLoading={jest.fn()}
                />
            )

            const inputField = getByPlaceholderText(
                'Enter 6-digit verification code from app or recovery code'
            ) as HTMLInputElement

            fireEvent.change(inputField, {target: {value: '123456'}})

            expect(setVerificationCodeMock).toHaveBeenCalled()
            expect(setErrorTextMock).toHaveBeenCalled()
        })
    })
})
