import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'
import {RootState} from 'state/types'
import {UserRole} from 'config/types/user'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {mockStore, renderWithRouter} from 'utils/testing'
import ConvertSubscriptionModal from '../ConvertSubscriptionModal'

const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

describe('ConvertSubscriptionModal', () => {
    const canduId = 'my-test-candu-id'
    const defaultLocation = '/app/test-page'

    const defaultState: Partial<RootState> = {
        currentUser: fromJS({
            role: {name: UserRole.Admin},
        }),
        currentAccount: fromJS({
            ...account,
            current_subscription: {
                ...account.current_subscription,
                status: 'active',
            },
        }),
        billing: fromJS(billingState),
    }

    const minProps = {
        canduId: canduId,
        isOpen: true,
        onClose: jest.fn(),
        onSubscribe: jest.fn(),
    }

    beforeEach(() => {
        useLocationSpy.mockReturnValue({pathname: defaultLocation} as any)
    })

    it('should not render', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState as any)}>
                <ConvertSubscriptionModal {...minProps} isOpen={false} />
            </Provider>
        )

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`
        )
        expect(canduDataId).toBeNull()
    })

    it('should render', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState as any)}>
                <ConvertSubscriptionModal {...minProps} />
            </Provider>
        )

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`
        )
        expect(canduDataId).not.toBeNull()
    })
})
