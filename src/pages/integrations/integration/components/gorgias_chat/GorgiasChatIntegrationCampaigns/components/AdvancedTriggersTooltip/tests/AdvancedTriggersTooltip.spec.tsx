import React from 'react'
import {act} from 'react-dom/test-utils'
import {fireEvent, render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {mockStore, renderWithRouter} from 'utils/testing'
import {RootState} from 'state/types'
import {UserRole} from 'config/types/user'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {AdvancedTriggersTooltip} from '../AdvancedTriggersTooltip'

const defaultState: Partial<RootState> = {
    currentUser: fromJS({
        role: {name: UserRole.Admin},
    }),
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

describe('<AdvancedTriggersTooltip />', () => {
    it('should render and open popup on click', async () => {
        const {getByText} = renderWithRouter(
            <Provider store={mockStore(defaultState as any)}>
                <AdvancedTriggersTooltip isConvertSubscriber={false} />
            </Provider>
        )

        const button = getByText(/info/i)

        act(() => {
            fireEvent.mouseOver(button)
        })

        await waitFor(() => {
            expect(
                getByText(/Unlock all conditions by subscribing to Convert./i)
            ).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(button)
        })

        expect(getByText(/Subscribe to Convert/i)).toBeInTheDocument()
    })

    it('should not render when is a convert subscriber', () => {
        const {queryByText} = render(
            <AdvancedTriggersTooltip isConvertSubscriber={true} />
        )

        expect(queryByText(/info/i)).not.toBeInTheDocument()
    })
})
