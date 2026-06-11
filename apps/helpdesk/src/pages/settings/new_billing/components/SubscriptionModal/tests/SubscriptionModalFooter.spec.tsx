import React from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { SubscriptionModalFooter } from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModalFooter'

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

        return render(<SubscriptionModalFooter {...props} />, {
            storeState: storeState as any,
        })
    }

    it('should render clickable button for admin', () => {
        const { getByRole } = renderForRole(UserRole.Admin)

        const confirmButton = getByRole('button', { name: confirmLabel })

        expect(confirmButton).toBeAriaEnabled()
    })

    it('should render disabled button for non-admin', () => {
        const { getByRole } = renderForRole(UserRole.BasicAgent)

        const confirmButton = getByRole('button', { name: confirmLabel })

        expect(confirmButton).toBeAriaDisabled()
    })
})
