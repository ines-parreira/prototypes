import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {OwnProps} from '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'

jest.mock(
    '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal',
    () => (props: OwnProps) => {
        const openClass = props.isOpen ? 'Open' : 'Closed'
        return (
            <div className={openClass}>TwoFactorAuthenticationModal mocked</div>
        )
    }
)

const store = configureMockStore([thunk])()

describe('<TwoFactorAuthenticationSection />', () => {
    describe('render()', () => {
        it('should render the Two-Factor Authentication Section', () => {
            const {baseElement} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationSection />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should open the Two-Factor Authentication Modal', async () => {
            const {baseElement, findByText} = render(
                <Provider store={store}>
                    <TwoFactorAuthenticationSection />
                </Provider>
            )

            const button = await findByText(/Enable Two-Factor Authentication/)
            fireEvent.click(button)

            expect(baseElement).toMatchSnapshot()
        })
    })
})
