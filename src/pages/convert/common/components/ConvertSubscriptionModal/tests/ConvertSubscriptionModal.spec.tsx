import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import moment from 'moment'
import * as ReactRouterDom from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import client from 'models/api/resources'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal/ConvertSubscriptionModal'
import { payingWithCreditCard } from 'pages/settings/new_billing/fixtures'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

const useLocationSpy = jest.spyOn(ReactRouterDom, 'useLocation')

const mockedDispatch = jest.fn()
const mockedServer = new MockAdapter(client)
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/billing/actions', () => ({
    fetchCreditCard: jest.fn(),
}))

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
        useLocationSpy.mockReturnValue({ pathname: defaultLocation } as any)
    })

    it('should not render', () => {
        renderWithStoreAndQueryClientAndRouter(
            <ConvertSubscriptionModal {...minProps} isOpen={false} />,
            defaultState,
        )

        const canduDataId = document.querySelector(
            `[data-candu-id="${canduId}"]`,
        )
        expect(canduDataId).toBeNull()
    })

    it('should render', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientAndRouter(
            <ConvertSubscriptionModal {...minProps} />,
            defaultState,
        )

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
            billing: fromJS({
                ...billingState,
                creditCard: null,
            }),
        }

        renderWithStoreAndQueryClientAndRouter(
            <ConvertSubscriptionModal {...minProps} />,
            stateWithTrial,
        )

        expect(screen.queryByText('I agree to')).not.toBeInTheDocument()
    })
})
