import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { useLocation } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { getBillingState } from 'models/billing/resources'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal/ConvertSubscriptionModal'
import type { RootState } from 'state/types'

jest.mock('models/billing/resources', () => ({
    ...jest.requireActual('models/billing/resources'),
    getBillingState: jest.fn(),
}))

const mockGetBillingState = getBillingState as jest.Mock

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('ConvertSubscriptionModal', () => {
    const canduId = 'my-test-candu-id'
    const defaultLocation = '/app/test-page'

    const defaultState: Partial<RootState> = {
        currentUser: fromJS({
            role: { name: UserRole.Admin },
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
        useLocationMock.mockReturnValue({ pathname: defaultLocation } as any)
    })

    it('should not render', () => {
        render(<ConvertSubscriptionModal {...minProps} isOpen={false} />, {
            storeState: defaultState,
        })

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`,
        )
        expect(canduDataId).toBeNull()
    })

    it('should render', async () => {
        mockGetBillingState.mockResolvedValue(payingWithCreditCard)

        render(<ConvertSubscriptionModal {...minProps} />, {
            storeState: defaultState,
        })

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`,
        )
        expect(canduDataId).not.toBeNull()

        await waitFor(() =>
            expect(
                screen.getByText('I agree to the', { exact: false }),
            ).toBeInTheDocument(),
        )
    })

    it('should render without terms & conditions for trial', () => {
        const today = moment()
        const stateWithTrial = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    trial_start_datetime: today
                        .subtract(1, 'day')
                        .toISOString(),
                    trial_end_datetime: today.add(1, 'day').toISOString(),
                    status: 'trialing',
                },
            }),
            billing: fromJS(billingState),
        }

        render(<ConvertSubscriptionModal {...minProps} />, {
            storeState: stateWithTrial,
        })

        expect(screen.queryByText('I agree to')).not.toBeInTheDocument()
    })
})
