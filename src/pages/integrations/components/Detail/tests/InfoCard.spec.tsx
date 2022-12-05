import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {notify} from 'state/notifications/actions'
import InfoCard from 'pages/integrations/components/Detail/InfoCard'
import {IntegrationType} from 'models/integration/types'
import {dummyAppDetail} from 'fixtures/apps'
import {PricingPlan} from 'models/integration/types/app'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

jest.mock('state/notifications/actions', () => {
    const actions: {notify: unknown} = jest.requireActual(
        'state/notifications/actions'
    )
    return {
        ...actions,
        notify: jest.fn(() => () => undefined),
    }
})

jest.mock('models/integration/resources', () => {
    const resources: {disconnectApp: unknown} = jest.requireActual(
        'models/integration/resources'
    )
    return {
        ...resources,
        disconnectApp: jest.fn((appId: 'success' | 'failure') =>
            Promise.resolve(appId === 'success' ? true : false)
        ),
    }
})

describe(`InfoCard`, () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <InfoCard {...dummyAppDetail} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should add a domain query param to connectUrl if an App', () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.App,
                    }}
                />
            </Provider>
        )

        expect(screen.getByText('Connect App').parentElement).toMatchSnapshot()
    })

    it('should render an internal link if not an app or not external', () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.Shopify,
                        isExternalConnectUrl: false,
                    }}
                />
            </Provider>
        )

        expect(screen.getByText('Connect App').parentElement).toMatchSnapshot()
    })

    it('should display correct information in pricing', () => {
        const {rerender} = render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        pricingPlan: PricingPlan.FREE,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText(/Free/))
        rerender(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        pricingDetails: '',
                    }}
                />
            </Provider>
        )

        expect(screen.getByText(/for pricing details/))
    })

    it('should have its connect button disabled', () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.Recharge,
                        isExternalConnectUrl: false,
                        isConnectionDisabled: true,
                    }}
                />
            </Provider>
        )
        expect(
            screen
                .getByRole('button', {name: 'Connect App'})
                .hasAttribute('disabled')
        ).toBeTruthy()
    })

    it('should have a functionnal disconnect flow', async () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        appId: 'success',
                        type: IntegrationType.App,
                        isConnected: true,
                    }}
                />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect App'}))
        await waitFor(() => screen.getByRole('button', {name: 'Disconnect'}))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect'}))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', {name: 'Connect App'})
            ).toBeTruthy()
        })
        expect((notify as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('should have a failed disconnection flow', async () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        appId: 'failure',
                        type: IntegrationType.App,
                        isConnected: true,
                    }}
                />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect App'}))
        await waitFor(() => screen.getByRole('button', {name: 'Disconnect'}))
        fireEvent.click(screen.getByRole('button', {name: 'Disconnect'}))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', {name: 'Connect App'})
            ).toBeFalsy()
        })
        expect((notify as jest.Mock).mock.calls).toMatchSnapshot()
    })

    it('should display a warning with the right text', () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        isUnapproved: true,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText(/has not been approved/))
    })

    it('should display other resources with the right text', () => {
        render(
            <Provider store={store}>
                <InfoCard
                    {...{
                        ...dummyAppDetail,
                        otherResources: [
                            {
                                title: 'Resource 1',
                                icon: 'ondemand_video',
                                url: 'https://www.gorgias.com',
                            },
                            {
                                title: 'Resource 2',
                                icon: 'ondemand_video',
                                url: 'https://www.gorgias.com',
                            },
                        ],
                    }}
                />
            </Provider>
        )
        expect(screen.getByText(/Resource 1/))
        expect(screen.getByText(/Resource 2/))
    })
})
