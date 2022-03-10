import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {deleteTwoFASecret} from '../../../../../models/twoFactorAuthentication/resources'
import TwoFactorAuthenticationDisableModal from '../TwoFactorAuthenticationDisableModal'

jest.mock('models/twoFactorAuthentication/resources')
const deleteTwoFASecretMock = deleteTwoFASecret as jest.MockedFunction<
    typeof deleteTwoFASecret
>

describe('<TwoFactorAuthenticationDisableModal />', () => {
    const minProps: ComponentProps<typeof TwoFactorAuthenticationDisableModal> =
        {
            isOpen: true,
            onClose: jest.fn(),
        }
    const store = configureMockStore([thunk])()

    it('should render the modal', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal {...minProps} />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should not render the modal when not open', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal
                    {...minProps}
                    isOpen={false}
                />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should call the delete function', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal {...minProps} />
            </Provider>
        )

        const continueButton = screen.getByText(/Deactivate Authentication/)
        fireEvent.click(continueButton)

        expect(deleteTwoFASecretMock).toHaveBeenCalled()
        expect(baseElement).toMatchSnapshot()
    })

    it('should show an error if the deletion failed', () => {
        deleteTwoFASecretMock.mockRejectedValue({
            response: {
                data: {
                    error: {msg: 'foo error deleteTwoFASecretMock'},
                },
            },
        })

        const {baseElement} = render(
            <Provider store={store}>
                <TwoFactorAuthenticationDisableModal {...minProps} />
            </Provider>
        )

        const continueButton = screen.getByText(/Deactivate Authentication/)
        fireEvent.click(continueButton)

        expect(deleteTwoFASecretMock).toHaveBeenCalled()
        expect(baseElement).toMatchSnapshot()
    })
})
