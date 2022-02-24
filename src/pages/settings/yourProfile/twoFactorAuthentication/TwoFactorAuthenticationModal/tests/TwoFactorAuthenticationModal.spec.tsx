import React, {ComponentProps} from 'react'
import {fireEvent, render, RenderResult, waitFor} from '@testing-library/react'
import TwoFactorAuthenticationModal from '../TwoFactorAuthenticationModal'
import {authenticatorData} from '../../../../../../fixtures/authenticatorData'
import {
    fetchAuthenticatorData,
    validateVerificationCode,
} from '../../../../../../models/twoFactorAuthentication/resources'

jest.mock('models/twoFactorAuthentication/resources')
const fetchAuthenticatorDataMock =
    fetchAuthenticatorData as jest.MockedFunction<typeof fetchAuthenticatorData>

const validateVerificationCodeMock =
    validateVerificationCode as jest.MockedFunction<
        typeof validateVerificationCode
    >

describe('<TwoFactorAuthenticationModal />', () => {
    const minProps: ComponentProps<typeof TwoFactorAuthenticationModal> = {
        isOpen: true,
        setIsOpen: jest.fn(),
    }

    const renderInitialModal = async (renderResult: RenderResult) => {
        const {baseElement, queryAllByText} = renderResult

        // Wait until the show class is added to the modal
        await waitFor(() =>
            expect(
                baseElement.getElementsByClassName('modal show').length
            ).toBe(1)
        )

        // wait for the loading spinners to disappear
        await waitFor(() => {
            expect(() => queryAllByText('Loading...')).toHaveLength(0)
        })
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

            const renderResult = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            const {baseElement, findByAltText} = renderResult

            await renderInitialModal(renderResult)

            // Wait for the qrcode library to render the image
            await findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step having error banner', async () => {
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const renderResult = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )
            const {baseElement, findByText} = renderResult

            await renderInitialModal(renderResult)

            // Wait for the qrcode library to render the image
            await findByText('Failed to load the QR code. Please try again.')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Validate authenticator code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const renderResult = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )
            const {baseElement, getByText} = renderResult

            await renderInitialModal(renderResult)

            const continueButton = getByText(/Continue/)
            fireEvent.click(continueButton)

            expect(baseElement).toMatchSnapshot()
        })

        it.each([true, false])(
            'should validate verification code and render modal with Recovery codes step if validation is successful',
            async (isVerificationCodeValid) => {
                fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

                if (isVerificationCodeValid) {
                    validateVerificationCodeMock.mockResolvedValue()
                } else {
                    validateVerificationCodeMock.mockRejectedValue({
                        response: {
                            data: {
                                error: {
                                    msg: 'foo error validateVerificationCode',
                                },
                            },
                        },
                    })
                }

                const renderResult = render(
                    <TwoFactorAuthenticationModal {...minProps} />
                )
                const {
                    baseElement,
                    getByPlaceholderText,
                    getByText,
                    findByText,
                } = renderResult

                await renderInitialModal(renderResult)

                let continueButton = getByText(/Continue/)
                fireEvent.click(continueButton)

                const inputField = getByPlaceholderText(
                    'Enter 6-digit verification code from app'
                ) as HTMLInputElement

                fireEvent.change(inputField, {target: {value: '123456'}})

                continueButton = getByText(/Continue/)
                fireEvent.click(continueButton)

                if (isVerificationCodeValid) {
                    await findByText('Recovery codes step')
                } else {
                    await findByText('foo error validateVerificationCode')
                }

                expect(baseElement).toMatchSnapshot()
            }
        )

        it('should render modal with QR code step after pressing back button', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const renderResult = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )
            const {baseElement, getByText, findByAltText} = renderResult

            await renderInitialModal(renderResult)

            const continueButton = getByText(/Continue/)
            fireEvent.click(continueButton)

            const backButton = getByText(/Back/)
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

            const renderResult = render(
                <TwoFactorAuthenticationModal
                    {...minProps}
                    isOpen
                    setIsOpen={setIsOpenMock}
                />
            )
            const {findByText} = renderResult

            await renderInitialModal(renderResult)

            const cancelButton = await findByText(/Cancel/)
            fireEvent.click(cancelButton)

            expect(setIsOpenMock).toHaveBeenCalledWith(false)
        })
    })
})
