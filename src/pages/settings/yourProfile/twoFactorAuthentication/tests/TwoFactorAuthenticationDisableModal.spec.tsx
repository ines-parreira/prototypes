import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {deleteTwoFASecret} from '../../../../../models/twoFactorAuthentication/resources'
import TwoFactorAuthenticationDisableModal from '../TwoFactorAuthenticationDisableModal'
import {User} from '../../../../../config/types/user'

jest.mock('models/twoFactorAuthentication/resources')
const deleteTwoFASecretMock = deleteTwoFASecret as jest.MockedFunction<
    typeof deleteTwoFASecret
>

describe('<TwoFactorAuthenticationDisableModal />', () => {
    const minProps: Omit<
        ComponentProps<typeof TwoFactorAuthenticationDisableModal>,
        'children'
    > = {
        title: 'Foo title',
        actionButtonText: 'Foo action button text',
        isOpen: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
    }
    const store = configureMockStore([thunk])()

    it('should render the modal', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal {...minProps}>
                    Foo <b>body</b>
                </TwoFactorAuthenticationDisableModal>
            </Provider>
        )

        // Wait until the show class is added to the modal
        await waitFor(() =>
            expect(
                baseElement.getElementsByClassName('modal show').length
            ).toBe(1)
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should not render the modal when not open', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal
                    {...minProps}
                    isOpen={false}
                >
                    Foo <b>body</b>
                </TwoFactorAuthenticationDisableModal>
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it.each([undefined, 1])(
        'should call the delete function',
        async (userId) => {
            const user = {id: userId} as User

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationDisableModal
                        {...minProps}
                        user={user}
                    >
                        Foo <b>body</b>
                    </TwoFactorAuthenticationDisableModal>
                </Provider>
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = screen.getByText(minProps.actionButtonText)
            fireEvent.click(continueButton)

            // wait for the loading spinners to disappear
            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })

            if (userId) {
                expect(deleteTwoFASecretMock).toHaveBeenCalledWith(userId)
            } else {
                expect(deleteTwoFASecretMock).toHaveBeenCalled()
            }

            expect(baseElement).toMatchSnapshot()
        }
    )

    it.each([undefined, 1])(
        'should show an error if the deletion failed',
        async (userId) => {
            deleteTwoFASecretMock.mockRejectedValue({
                response: {
                    data: {
                        error: {msg: 'foo error deleteTwoFASecretMock'},
                    },
                },
            })
            const user = {id: userId} as User

            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationDisableModal
                        {...minProps}
                        user={user}
                    >
                        Foo <b>body</b>
                    </TwoFactorAuthenticationDisableModal>
                </Provider>
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = screen.getByText(minProps.actionButtonText)
            fireEvent.click(continueButton)

            // wait for the loading spinners to disappear
            await waitFor(() => {
                expect(() => screen.queryAllByText('Loading...')).toHaveLength(
                    0
                )
            })

            if (userId) {
                expect(deleteTwoFASecretMock).toHaveBeenCalledWith(userId)
            } else {
                expect(deleteTwoFASecretMock).toHaveBeenCalled()
            }

            expect(baseElement).toMatchSnapshot()
        }
    )
})
