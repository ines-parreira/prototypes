import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import moment from 'moment'
import { useLocation } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import client from 'models/api/resources'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal/ConvertSubscriptionModal'
import { payingWithCreditCard } from 'pages/settings/new_billing/fixtures'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

const useLocationMock = useLocation as jest.Mock

const mockedDispatch = jest.fn()
const mockedServer = new MockAdapter(client)
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
            billing: fromJS(billingState),
        }

        renderWithStoreAndQueryClientAndRouter(
            <ConvertSubscriptionModal {...minProps} />,
            stateWithTrial,
        )

        expect(screen.queryByText('I agree to')).not.toBeInTheDocument()
    })
})
