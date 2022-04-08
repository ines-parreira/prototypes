import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import RestrictedPage from 'pages/common/components/RestrictedPage'
import history from 'pages/history'
import {user} from 'fixtures/users'
import {UserRole} from 'config/types/user'
import {PageSection} from 'config/pages'
import {RootState, StoreDispatch} from 'state/types'

import withUserRoleRequired from '../withUserRoleRequired'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const AnyComponent = () => <div>Just a component...</div>

jest.mock(
    'pages/common/components/RestrictedPage',
    () => (props: ComponentProps<typeof RestrictedPage>) =>
        (
            <div>
                <span>Required role: {props.requiredRole}</span>
                <span>Page: {props.page}</span>
            </div>
        )
)

describe('withUserRoleRequired', () => {
    const stateWithAdequateRole: Partial<RootState> = {
        currentUser: fromJS(user),
    }

    const stateWithoutAdequateRole: Partial<RootState> = {
        currentUser: fromJS({
            ...user,
            roles: [
                {
                    name: UserRole.ObserverAgent,
                },
            ],
        }),
    }

    beforeEach(() => {
        jest.resetModules()
    })

    it('should return the wrapped component if the user has an adequate role', () => {
        const WrappedComponent = withUserRoleRequired(
            AnyComponent,
            UserRole.Admin
        )

        const {container} = render(
            <Provider store={mockStore(stateWithAdequateRole)}>
                <WrappedComponent />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not return the wrapped component if the user does not have an adequate role and pass necessary props', () => {
        const WrappedComponent = withUserRoleRequired(
            AnyComponent,
            UserRole.Admin,
            PageSection.Billing
        )

        const {container} = render(
            <Provider store={mockStore(stateWithoutAdequateRole)}>
                <WrappedComponent />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should redirect to a page passed via "redirectTo"', () => {
        const WrappedComponent = withUserRoleRequired(
            AnyComponent,
            UserRole.Admin,
            undefined,
            'foo/bar'
        )

        render(
            <Provider store={mockStore(stateWithoutAdequateRole)}>
                <WrappedComponent />
            </Provider>
        )

        expect(history.push).toHaveBeenCalledWith('foo/bar')
    })
})
