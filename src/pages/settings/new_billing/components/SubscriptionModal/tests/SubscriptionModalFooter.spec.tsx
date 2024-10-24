import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {UserRole} from 'config/types/user'
import SubscriptionModalFooter from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModalFooter'
import {mockStore} from 'utils/testing'

describe('SubscriptionModalFooter', () => {
    const confirmLabel = 'Confirm'
    const props = {
        confirmLabel: confirmLabel,
        isUpdating: false,
        isDisabled: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    const renderForRole = (role: UserRole) => {
        const storeState = {
            currentUser: fromJS({
                role: {
                    name: role,
                },
            }),
        }

        return render(
            <Provider store={mockStore(storeState as any)}>
                <SubscriptionModalFooter {...props} />
            </Provider>
        )
    }

    it('should render clickable button for admin', () => {
        const {getByRole} = renderForRole(UserRole.Admin)

        const confirmButton = getByRole('button', {name: confirmLabel})

        expect(confirmButton).toBeAriaEnabled()
    })

    it('should render disabled button for non-admin', () => {
        const {getByRole} = renderForRole(UserRole.BasicAgent)

        const confirmButton = getByRole('button', {name: confirmLabel})

        expect(confirmButton).toBeAriaDisabled()
    })
})
