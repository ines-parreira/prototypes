import React, {ComponentProps} from 'react'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import TwoFactorAuthenticationModal from '../TwoFactorAuthenticationModal'
import {authenticatorData} from '../../../../../../fixtures/authenticatorData'
import {
    createRecoveryCodes,
    fetchAuthenticatorData,
    fetchAuthenticatorDataRenewed,
    saveTwoFASecret,
    validateVerificationCode,
} from '../../../../../../models/twoFactorAuthentication/resources'
import {recoveryCodes as recoveryCodesFixture} from '../../../../../../fixtures/recoveryCodes'
import {RootState, StoreDispatch} from '../../../../../../state/types'

jest.mock('models/twoFactorAuthentication/resources')
const fetchAuthenticatorDataMock =
    fetchAuthenticatorData as jest.MockedFunction<typeof fetchAuthenticatorData>

const fetchAuthenticatorDataRenewedMock =
    fetchAuthenticatorDataRenewed as jest.MockedFunction<
        typeof fetchAuthenticatorDataRenewed
    >

const validateVerificationCodeMock =
    validateVerificationCode as jest.MockedFunction<
        typeof validateVerificationCode
    >

const saveTwoFASecretMock = saveTwoFASecret as jest.MockedFunction<
    typeof saveTwoFASecret
>

const createRecoveryCodesMock = createRecoveryCodes as jest.MockedFunction<
    typeof createRecoveryCodes
>

describe('<TwoFactorAuthenticationModal />', () => {
    const minProps: ComponentProps<typeof TwoFactorAuthenticationModal> = {
        isOpen: true,
        setIsOpen: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const renderInitialModal = async (baseElement: HTMLElement) => {
        // Wait until the show class is added to the modal
        await waitFor(() =>
            expect(
                baseElement.getElementsByClassName('modal show').length
            ).toBe(1)
        )

        // wait for the loading spinners to disappear
        await waitFor(() => {
            expect(() => screen.queryAllByText('Loading...')).toHaveLength(0)
        })
    }

    describe('render()', () => {
        it('should not render the modal', () => {
            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isOpen={false}
                    />
                </Provider>
            )
            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            // Wait for the qrcode library to render the image
            await screen.findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step having renewed secret', async () => {
            fetchAuthenticatorDataRenewedMock.mockResolvedValue(
                authenticatorData
            )
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: true,
                }),
            })

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            // Wait for the qrcode library to render the image
            await screen.findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step having error banner', async () => {
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            // Wait for the qrcode library to render the image
            await screen.findByText(
                'Failed to fetch the QR code. Please try again.'
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Validate authenticator code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            const continueButton = screen.getByText(/Continue/)
            fireEvent.click(continueButton)

            // wait for the loading spinners to disappear
            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })

            expect(baseElement).toMatchSnapshot()
        })

        describe('Validate verification code', () => {
            const validateInput = async (baseElement: HTMLElement) => {
                await renderInitialModal(baseElement)

                // Navigate to step 2
                let continueButton = screen.getByText(/Continue/)
                fireEvent.click(continueButton)

                const inputField = screen.getByPlaceholderText(
                    'Enter 6-digit verification code from app'
                ) as HTMLInputElement
                fireEvent.change(inputField, {target: {value: '123456'}})

                // Try to navigate to step 3 in order to trigger validation
                continueButton = screen.getByText(/Continue/)
                fireEvent.click(continueButton)

                // wait for the loading spinners to disappear
                await waitForElementToBeRemoved(() =>
                    screen.getAllByText('Loading...')
                )
            }

            const handleInputValidationFailed = async (
                baseElement: HTMLElement
            ) => {
                expect(baseElement).toMatchSnapshot(
                    'error banner and continue button disabled'
                )

                const inputField = screen.getByPlaceholderText(
                    'Enter 6-digit verification code from app'
                ) as HTMLInputElement
                fireEvent.change(inputField, {target: {value: '123457'}})

                await waitFor(() => {
                    expect(
                        screen.getByText(/Continue/).getAttribute('disabled')
                    ).toBe(null)
                })

                expect(baseElement).toMatchSnapshot(
                    'no error banner and continue button enabled'
                )
            }

            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)

            it('should render modal with error banner because validation failed', async () => {
                validateVerificationCodeMock.mockRejectedValue({
                    response: {
                        data: {
                            error: {
                                msg: 'foo error validateVerificationCode',
                            },
                        },
                    },
                })
                saveTwoFASecretMock.mockResolvedValue()

                const {baseElement} = render(
                    <Provider store={mockStore()}>
                        <TwoFactorAuthenticationModal {...minProps} />
                    </Provider>
                )

                await validateInput(baseElement)
                await handleInputValidationFailed(baseElement)
            })

            it('should render modal with error banner because saving the secret failed', async () => {
                validateVerificationCodeMock.mockResolvedValue()
                saveTwoFASecretMock.mockRejectedValue({
                    response: {
                        data: {
                            error: {msg: 'foo error saveTwoFASecret'},
                        },
                    },
                })

                const {baseElement} = render(
                    <Provider store={mockStore()}>
                        <TwoFactorAuthenticationModal {...minProps} />
                    </Provider>
                )

                await validateInput(baseElement)
                await handleInputValidationFailed(baseElement)
            })

            it('should render modal with Recovery codes step because validation is successful and the secret was saved to the database', async () => {
                validateVerificationCodeMock.mockResolvedValue()
                saveTwoFASecretMock.mockResolvedValue()
                createRecoveryCodesMock.mockResolvedValue(recoveryCodesFixture)

                const {baseElement} = render(
                    <Provider store={mockStore()}>
                        <TwoFactorAuthenticationModal {...minProps} />
                    </Provider>
                )

                await validateInput(baseElement)

                expect(baseElement).toMatchSnapshot('Recovery codes step')
            })

            it('should call setIsOpen with false value which closes the modal because the process has been finished', async () => {
                const setIsOpenMock = jest.fn()
                validateVerificationCodeMock.mockResolvedValue()
                saveTwoFASecretMock.mockResolvedValue()
                createRecoveryCodesMock.mockResolvedValue(recoveryCodesFixture)

                const {baseElement} = render(
                    <Provider store={mockStore()}>
                        <TwoFactorAuthenticationModal
                            {...minProps}
                            setIsOpen={setIsOpenMock}
                        />
                    </Provider>
                )

                await validateInput(baseElement)

                const checkbox = screen.getByText(
                    "I've saved my recovery codes"
                )
                fireEvent.click(checkbox)

                await waitFor(() => {
                    expect(
                        screen.getByText(/Continue/).getAttribute('disabled')
                    ).toBe(null)
                })

                const continueButton = screen.getByText(/Continue/)
                fireEvent.click(continueButton)

                expect(setIsOpenMock).toHaveBeenCalledWith(false)
            })
        })

        it('should render modal with QR code step after pressing back button', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            const continueButton = screen.getByText(/Continue/)
            fireEvent.click(continueButton)

            // wait for the loading spinners to disappear
            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })

            const backButton = screen.getByText(/Back/)
            fireEvent.click(backButton)

            // wait for the loading spinners to disappear
            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })

            // Wait for the qrcode library to render the image
            await screen.findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })

        it('should call setIsOpen with false value which closes the modal on cancel', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const setIsOpenMock = jest.fn()

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isOpen
                        setIsOpen={setIsOpenMock}
                    />
                </Provider>
            )

            await renderInitialModal(baseElement)

            const cancelButton = await screen.findByText(/Cancel/)
            fireEvent.click(cancelButton)

            expect(setIsOpenMock).toHaveBeenCalledWith(false)
        })
    })
})
