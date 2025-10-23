import React, { ComponentProps } from 'react'

import { history } from '@repo/routing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PageSection } from 'config/pages'
import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import RestrictedPage from 'pages/common/components/RestrictedPage'
import { RootState, StoreDispatch } from 'state/types'

import { rootWithUserRoleRequired } from '../withUserRoleRequired'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const AnyComponent = () => <div>OK</div>

jest.mock(
    'pages/common/components/RestrictedPage',
    () => (props: ComponentProps<typeof RestrictedPage>) => (
        <div>
            <span>Required role: {props.requiredRole}</span>
            <span>Page: {props.page}</span>
        </div>
    ),
)

describe('rootWithUserRoleRequired', () => {
    const stateWithAdequateRole: Partial<RootState> = {
        currentUser: fromJS(user),
    }

    const stateWithoutAdequateRole: Partial<RootState> = {
        currentUser: fromJS({
            ...user,
            role: {
                name: UserRole.ObserverAgent,
            },
        }),
    }

    beforeEach(() => {
        jest.resetModules()
    })

    it('should return the bare component if no role is passed', () => {
        const WrappedComponent = rootWithUserRoleRequired(AnyComponent)

        render(
            <Provider store={mockStore(stateWithAdequateRole)}>
                <WrappedComponent />
            </Provider>,
        )

        expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should return the wrapped component if the user has an adequate role', () => {
        const WrappedComponent = rootWithUserRoleRequired(
            AnyComponent,
            UserRole.Admin,
        )

        render(
            <Provider store={mockStore(stateWithAdequateRole)}>
                <WrappedComponent />
            </Provider>,
        )

        expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should not return the wrapped component if the user does not have an adequate role and pass necessary props', () => {
        const WrappedComponent = rootWithUserRoleRequired(
            AnyComponent,
            UserRole.Admin,
            PageSection.NewBilling,
        )

        const { container } = render(
            <Provider store={mockStore(stateWithoutAdequateRole)}>
                <WrappedComponent />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should redirect to a page passed via "redirectTo"', () => {
        const WrappedComponent = rootWithUserRoleRequired(
            AnyComponent,
            UserRole.Admin,
            undefined,
            'foo/bar',
        )

        render(
            <Provider store={mockStore(stateWithoutAdequateRole)}>
                <WrappedComponent />
            </Provider>,
        )

        expect(history.replace).toHaveBeenCalledWith('foo/bar')
    })
})
