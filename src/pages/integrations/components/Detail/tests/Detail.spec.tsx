import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, waitFor, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Detail from 'pages/integrations/components/Detail'
import {IntegrationType} from 'models/integration/types'
import {dummyAppDetail} from 'fixtures/apps'
import {PricingPlan, TrialPeriod} from 'models/integration/types/app'

const mockStore = configureMockStore([thunk])
const store = mockStore({currentAccount: fromJS({domain: '20-1 rpz'})})

describe(`Detail`, () => {
    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <Detail {...dummyAppDetail} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should add a domain query param to connectUrl if an App', () => {
        render(
            <Provider store={store}>
                <Detail
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
                <Detail
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
                <Detail
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
                <Detail
                    {...{
                        ...dummyAppDetail,
                        pricingDetails: '',
                    }}
                />
            </Provider>
        )

        expect(screen.getByText(/for pricing details/))
    })

    it('should display correct trial tag', () => {
        const {rerender} = render(
            <Provider store={store}>
                <Detail
                    {...{
                        ...dummyAppDetail,
                        hasFreeTrial: true,
                        freeTrialPeriod: TrialPeriod.CUSTOM,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText('FREE TRIAL'))
        rerender(
            <Provider store={store}>
                <Detail
                    {...{
                        ...dummyAppDetail,
                        hasFreeTrial: true,
                        freeTrialPeriod: TrialPeriod.FOURTEEN,
                    }}
                />
            </Provider>
        )
        expect(screen.getByText('14 DAYS FREE TRIAL'))
    })

    it('should not display more than 3 screenshots', () => {
        render(
            <Provider store={store}>
                <Detail {...dummyAppDetail} />
            </Provider>
        )

        expect(screen.getAllByAltText(/Screenshot number/)).toHaveLength(3)
    })

    it('should not display supportEmail and supportPhone if not an App', () => {
        render(
            <Provider store={store}>
                <Detail
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.Shopify,
                        isExternalConnectUrl: false,
                    }}
                />
            </Provider>
        )

        expect(
            screen.queryByText(new RegExp(dummyAppDetail.supportEmail))
        ).toBeNull()
        expect(
            screen.queryByText(
                new RegExp(dummyAppDetail.supportPhone.replace('+', '\\+'))
            )
        ).toBeNull()
    })

    it('should display carousel on screenshot click, and remove it on close', async () => {
        render(
            <Provider store={store}>
                <Detail {...dummyAppDetail} />
            </Provider>
        )

        fireEvent.click(screen.getAllByAltText(/Screenshot number/)[0])
        await waitFor(() => expect(screen.getAllByAltText(/Showcase number/)))
        fireEvent.click(screen.getByRole('button', {name: 'close'}))
        await waitFor(() =>
            expect(screen.queryByAltText(/Showcase number/)).toBeNull()
        )
    })

    it('should have a carousel displaying all screenshots', async () => {
        render(
            <Provider store={store}>
                <Detail {...dummyAppDetail} />
            </Provider>
        )
        fireEvent.click(screen.getAllByAltText(/Screenshot number/)[0])
        await screen.findAllByAltText(/Showcase number/)
        expect(screen.getAllByAltText(/Showcase number/)).toMatchSnapshot()
    })

    it('should display a banner with the right text', () => {
        const notification = 'Beware!'
        render(
            <Provider store={store}>
                <Detail
                    {...{
                        ...dummyAppDetail,
                        type: IntegrationType.Recharge,
                        isExternalConnectUrl: false,
                        notification: {
                            message: notification,
                        },
                    }}
                />
            </Provider>
        )
        expect(screen.getByText(notification))
    })
    it('should have its connect button disabled', () => {
        render(
            <Provider store={store}>
                <Detail
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
})
