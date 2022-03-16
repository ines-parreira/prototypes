import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import TwoFactorAuthenticationSection from '../TwoFactorAuthenticationSection'
import {OwnProps} from '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'
import {RootState, StoreDispatch} from '../../../../../state/types'

jest.mock(
    '../TwoFactorAuthenticationModal/TwoFactorAuthenticationModal',
    () => (props: OwnProps) => {
        const openClass = props.isOpen ? 'Open' : 'Closed'
        return (
            <div className={openClass}>TwoFactorAuthenticationModal mocked</div>
        )
    }
)

describe('<TwoFactorAuthenticationSection />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    describe('render()', () => {
        it.each([true, false])(
            'should render the Two-Factor Authentication Section with status tag',
            (has2FAEnabled) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: has2FAEnabled,
                    }),
                })

                const {baseElement} = render(
                    <Provider store={store}>
                        <TwoFactorAuthenticationSection />
                    </Provider>
                )

                expect(baseElement).toMatchSnapshot()
            }
        )

        it.each([true, false])(
            'should open the Two-Factor Authentication Modal via Enable or Update button',
            async (has2FAEnabled) => {
                const store = mockStore({
                    currentUser: fromJS({
                        has_2fa_enabled: has2FAEnabled,
                    }),
                })

                const {baseElement, findByText} = render(
                    <Provider store={store}>
                        <TwoFactorAuthenticationSection />
                    </Provider>
                )

                const button = await findByText(
                    has2FAEnabled
                        ? /Update Method/
                        : /Enable Two-Factor Authentication/
                )
                fireEvent.click(button)

                expect(baseElement).toMatchSnapshot()
            }
        )
    })
})
