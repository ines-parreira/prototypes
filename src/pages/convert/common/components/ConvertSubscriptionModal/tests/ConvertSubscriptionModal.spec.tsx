import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'
import moment from 'moment'
import {waitFor} from '@testing-library/react'
import {RootState} from 'state/types'
import {UserRole} from 'config/types/user'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {mockStore, renderWithRouter} from 'utils/testing'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal/ConvertSubscriptionModal'

const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

const mockedDispatch = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/billing/actions', () => ({
    fetchCreditCard: jest.fn(),
}))

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
        billing: fromJS({
            ...billingState,
            creditCard: {
                name: 'Alex',
                number: '545454545454',
                expDate: `10/${moment().add(1, 'year').format('YY')}`,
                cvc: '123',
            },
        }),
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

    it('should render', async () => {
        const {getByText} = renderWithRouter(
            <Provider store={mockStore(defaultState as any)}>
                <ConvertSubscriptionModal {...minProps} />
            </Provider>
        )

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`
        )
        expect(canduDataId).not.toBeNull()

        await waitFor(() =>
            expect(
                getByText('I agree to the', {exact: false})
            ).toBeInTheDocument()
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
            billing: fromJS({
                ...billingState,
                creditCard: null,
            }),
        }

        const {queryByText} = renderWithRouter(
            <Provider store={mockStore(stateWithTrial as any)}>
                <ConvertSubscriptionModal {...minProps} />
            </Provider>
        )

        expect(queryByText('I agree to')).not.toBeInTheDocument()
    })
})
