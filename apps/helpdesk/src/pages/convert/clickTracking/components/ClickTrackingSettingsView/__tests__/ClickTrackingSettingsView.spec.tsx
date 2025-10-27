import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { RootState, StoreDispatch } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'

import ClickTrackingPaywallView from '../../ClickTrackingPaywallView'
import ClickTrackingSettingsView from '../ClickTrackingSettingsView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore(getStateWithHelpdeskPlan())

const ReduxProvider = ({ children }: { children?: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({}),
}))

jest.mock('pages/convert/common/hooks/useConvertApi', () => {
    return {
        useConvertApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_custom_domain: () =>
                    Promise.resolve({
                        data: {},
                        status: 404,
                    }),
            },
        }),
    }
})

describe('<ClickTrackingSettingsView />', () => {
    beforeEach(() => {
        store.clearActions()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)

        render(
            <MemoryRouter>
                <ReduxProvider>
                    <Route path="/app/settings/convert/click-tracking">
                        <ClickTrackingPaywallView />
                    </Route>
                    <ClickTrackingSettingsView />
                </ReduxProvider>
            </MemoryRouter>,
        )

        expect(
            screen.queryByText(
                /With the Gorgias click tracking service you can now track clicks/,
            ),
        ).not.toBeInTheDocument()
        expect(
            screen.getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        render(<ClickTrackingSettingsView />, {
            wrapper: ReduxProvider,
        })

        expect(
            screen.getByText(
                /With the Gorgias click tracking service you can now track clicks/,
            ),
        ).toBeInTheDocument()
    })
})
