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

import {logEvent, SegmentEvent} from 'common/segment'
import {authenticatorData} from 'fixtures/authenticatorData'
import {
    createRecoveryCodes,
    fetchAuthenticatorData,
    fetchAuthenticatorDataRenewed,
    saveTwoFASecret,
    validateVerificationCode,
} from 'models/twoFactorAuthentication/resources'
import {recoveryCodes as recoveryCodesFixture} from 'fixtures/recoveryCodes'
import {RootState, StoreDispatch} from 'state/types'
import TwoFactorAuthenticationModal from '../TwoFactorAuthenticationModal'

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

jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

const waitForModal = async (baseElement: HTMLElement) => {
    await waitFor(() =>
        expect(baseElement.getElementsByClassName('modal show').length).toBe(1)
    )
}

const renderInitialModal = async (baseElement: HTMLElement) => {
    // Wait until the show class is added to the modal
    await waitForModal(baseElement)

    // Navigate to QR code step
    const continueButton = screen.getByText('Continue')
    fireEvent.click(continueButton)

    // Wait for the loading elements to disappear
    await waitForElementToBeRemoved(() => screen.getAllByText('Loading...'))
    expect(screen.getByText('Back').parentElement).not.toHaveAttribute(
        'aria-disabled',
        'true'
    )
}

const validateInput = async (baseElement: HTMLElement) => {
    await renderInitialModal(baseElement)
    fillVerificationCode()
    fillPassword()
    await continueToNextStep()
}

const fillVerificationCode = () => {
    const inputField = screen.getByPlaceholderText<HTMLInputElement>(
        'Enter 6-digit verification code from app or recovery code'
    )
    fireEvent.change(inputField, {target: {value: '123456'}})
}

const fillPassword = () => {
    const inputField = screen.getByPlaceholderText<HTMLInputElement>(
        'Enter your password'
    )
    fireEvent.change(inputField, {target: {value: 'abcde'}})
}

const continueToNextStep = async () => {
    // Try to navigate to step 3 in order to trigger validation
    const continueButton = screen.getByText('Continue')
    fireEvent.click(continueButton)

    // wait for the loading spinners to disappear
    await waitForElementToBeRemoved(() => screen.getAllByText('Loading...'))
}

const handleInputValidationFailed = async (baseElement: HTMLElement) => {
    expect(baseElement).toMatchSnapshot(
        'error banner and continue button disabled'
    )

    const inputField = screen.getByPlaceholderText<HTMLInputElement>(
        'Enter 6-digit verification code from app or recovery code'
    )
    fireEvent.change(inputField, {target: {value: '123457'}})

    await waitFor(() => {
        expect(screen.getByText('Continue').parentElement).not.toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    expect(baseElement).toMatchSnapshot(
        'no error banner and continue button enabled'
    )
}

describe('<TwoFactorAuthenticationModal />', () => {
    const minProps: ComponentProps<typeof TwoFactorAuthenticationModal> = {
        isOpen: true,
        initialBannerText: 'Default initialBannerText',
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

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

        it('should render modal with app setup step', async () => {
            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await waitForModal(baseElement)
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
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.TwoFaModalOpened
            )
        })

        it('should render modal with QR Code step having error banner', async () => {
            fetchAuthenticatorDataMock.mockRejectedValue({foo: 'api error'})

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await waitForModal(baseElement)

            // Wait for the qrcode library to render the image
            await screen.findByText(
                'Failed to fetch the QR code. Please try again.'
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Validate authenticator code step', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                    has_password: true,
                }),
            })

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            expect(baseElement).toMatchSnapshot()
        })

        describe('Validate verification code', () => {
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

                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        has_password: true,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
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

                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        has_password: true,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
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

                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        has_password: true,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
                        <TwoFactorAuthenticationModal {...minProps} />
                    </Provider>
                )

                await validateInput(baseElement)

                expect(
                    screen.getByText("I've saved my recovery codes")
                ).toBeInTheDocument()
                expect(baseElement).toMatchSnapshot('Recovery codes step')
            })

            it('should call onFinish() because the process has been finished', async () => {
                const onFinishMock = jest.fn()
                validateVerificationCodeMock.mockResolvedValue()
                saveTwoFASecretMock.mockResolvedValue()
                createRecoveryCodesMock.mockResolvedValue(recoveryCodesFixture)

                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        has_password: true,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
                        <TwoFactorAuthenticationModal
                            {...minProps}
                            onFinish={onFinishMock}
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
                        screen.getByText('Continue').getAttribute('disabled')
                    ).toBe(null)
                })

                const continueButton = screen.getByText('Continue')
                fireEvent.click(continueButton)

                expect(onFinishMock).toHaveBeenCalled()
            })

            it('should call onFinish() if modal is dismissed on last step', async () => {
                const onFinish = jest.fn()
                validateVerificationCodeMock.mockResolvedValue()
                saveTwoFASecretMock.mockResolvedValue()
                createRecoveryCodesMock.mockResolvedValue(recoveryCodesFixture)

                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: false,
                        has_password: true,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
                        <TwoFactorAuthenticationModal
                            {...minProps}
                            onFinish={onFinish}
                        />
                    </Provider>
                )

                await validateInput(baseElement)

                // click on the X button from the modal header
                const closeButton = screen.getByText('×')
                fireEvent.click(closeButton)

                expect(onFinish).toHaveBeenCalled()
            })
        })

        it('should render modal with app setup step after pressing back button', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await renderInitialModal(baseElement)

            const backButton = screen.getByText('Back')
            fireEvent.click(backButton)

            await screen.findByText('Have your mobile device ready')
            expect(baseElement).toMatchSnapshot()
        })

        it('should call onCancel() when the modal is dismissed', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const onCancelMock = jest.fn()

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isOpen
                        onCancel={onCancelMock}
                    />
                </Provider>
            )

            await waitForModal(baseElement)

            const cancelButton = await screen.findByText('Remind Me Later')
            fireEvent.click(cancelButton)

            expect(onCancelMock).toHaveBeenCalled()
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.TwoFaModalCancelled
            )
        })

        it('should render modal as open without being able to dismiss it because 2fa is required', async () => {
            fetchAuthenticatorDataMock.mockResolvedValue(authenticatorData)
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                }),
                currentAccount: fromJS({
                    settings: [
                        {
                            type: 'access',
                            data: {
                                two_fa_enforced_datetime: '2022-03-24T14:17:05',
                            },
                        },
                    ],
                }),
            })

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationModal {...minProps} />
                </Provider>
            )

            await waitForModal(baseElement)

            expect(screen.queryByText('Remind Me Later')).toBeNull()
        })

        it('should render the modal with a validation code step first on update before other steps', async () => {
            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                    has_password: true,
                }),
            })
            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isUpdate={true}
                    />
                </Provider>
            )

            await screen.findByText('Verify your code')
            expect(baseElement).toMatchSnapshot()
        })

        it('should render the modal with an error banner because the code is not valid', async () => {
            validateVerificationCodeMock.mockRejectedValue({
                response: {
                    data: {
                        error: {
                            msg: 'Test error invalid code',
                        },
                    },
                },
            })

            const {baseElement} = render(
                <Provider store={mockStore()}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isUpdate={true}
                    />
                </Provider>
            )

            await waitForModal(baseElement)
            fillVerificationCode()

            await handleInputValidationFailed(baseElement)
        })

        it('should render modal with the QR code step because the code is valid', async () => {
            validateVerificationCodeMock.mockResolvedValue()

            const store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                    has_password: true,
                }),
            })

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationModal
                        {...minProps}
                        isUpdate={true}
                    />
                </Provider>
            )

            await waitForModal(baseElement)
            fillVerificationCode()
            fillPassword()
            await continueToNextStep()
            await continueToNextStep()

            // Wait for the qrcode library to render the image
            await screen.findByAltText('The QR Code to scan')

            expect(baseElement).toMatchSnapshot()
        })
    })
})
