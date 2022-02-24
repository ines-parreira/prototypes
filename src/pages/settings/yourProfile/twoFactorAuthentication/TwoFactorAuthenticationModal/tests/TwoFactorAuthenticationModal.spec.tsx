import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import TwoFactorAuthenticationModal from '../TwoFactorAuthenticationModal'
import {authenticatorData} from '../../../../../../fixtures/authenticatorData'
import {fetchAuthenticatorData} from '../../../../../../models/twoFactorAuthentication/resources'

jest.mock('models/twoFactorAuthentication/resources')
const fetchAuthenticatorDataMock =
    fetchAuthenticatorData as jest.MockedFunction<typeof fetchAuthenticatorData>

describe('<TwoFactorAuthenticationModal />', () => {
    const minProps: ComponentProps<typeof TwoFactorAuthenticationModal> = {
        isOpen: true,
        setIsOpen: jest.fn(),
    }

    describe('render()', () => {
        it('should not render the modal', () => {
            const {baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} isOpen={false} />
            )
            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {baseElement, findByAltText} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            // Wait for the qrcode library to render the image
            await findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step having error banner', async () => {
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const {baseElement, findByText} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            // Wait for the qrcode library to render the image
            await findByText('Failed to load the QR code. Please try again.')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Validate authenticator code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Recovery codes step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            let continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR code step after pressing back button', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {baseElement, findByText, findByAltText} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            const backButton = await findByText(/Back/)
            fireEvent.click(backButton)

            // Wait for the qrcode library to render the image
            await findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should call setIsOpen with false value which closes the modal on cancel', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const setIsOpenMock = jest.fn()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const useStateMock: any = (useState: any) => [
                useState,
                setIsOpenMock,
            ]
            jest.spyOn(React, 'useState').mockImplementation(useStateMock)

            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal
                    {...minProps}
                    isOpen
                    setIsOpen={setIsOpenMock}
                />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const cancelButton = await findByText(/Cancel/)
            fireEvent.click(cancelButton)

            expect(setIsOpenMock).toHaveBeenCalledWith(false)
        })
    })
})
