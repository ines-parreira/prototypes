import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'

import {AccountFeature} from 'state/currentAccount/types'
import {billingState} from 'fixtures/billing'
import {
    customHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {account} from 'fixtures/account'
import {PaywallConfig} from 'config/paywalls'
import {RootState, StoreDispatch} from 'state/types'

import FeaturePaywall from '../FeaturePaywall'

jest.mock('react-images', () => {
    return ({
        images,
        isOpen,
        onClose,
        onClickImage,
    }: {
        images: any[]
        isOpen: boolean
        onClose: () => void
        onClickImage: () => void
    }) => (
        <div data-testid={`lightbox-${isOpen ? 'opened' : 'closed'}`}>
            isOpen: {JSON.stringify(isOpen)}
            images: {JSON.stringify(images)}
            <button
                data-testid="close-button"
                onClick={() => onClose()}
                value="close"
            />
            <button
                data-testid="click-image-button"
                onClick={() => onClickImage()}
                value="click image"
            />
        </div>
    )
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<FeaturePaywall />', () => {
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }

    const defaultPaywallConfig: PaywallConfig = {
        pageHeader: 'Feature paywall',
        header: 'Feature',
        description: 'Feature description',
        testimonial: {
            author: {
                name: 'John Doe',
                avatar: `/static/private/img/paywalls/avatars/johndoe.jpg`,
                position: 'Customer Experience Manager',
                company: {
                    name: 'Acme Inc.',
                    href: 'https://acme.com/',
                },
            },
            text: 'Testimonial text',
        },
        preview: '/static/private/img/paywalls/screens/paywall.png',
    }

    const minProps: ComponentProps<typeof FeaturePaywall> = {
        feature: AccountFeature.RevenueStatistics,
        paywallConfigs: {
            [AccountFeature.RevenueStatistics]: defaultPaywallConfig,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it.each<
        [string, ComponentProps<typeof FeaturePaywall>, Partial<RootState>]
    >([
        [
            'paywall config is undefined',
            {...minProps, feature: AccountFeature.SatisfactionSurveys},
            defaultState,
        ],
        [
            'required plan name was not found',
            {...minProps, feature: AccountFeature.Api1stPartyRateLimit},
            defaultState,
        ],
    ])('should render empty page when %s', (testName, props, state) => {
        const {container} = render(
            <Provider store={mockStore(state)}>
                <FeaturePaywall {...props} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render paywall for the feature', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <FeaturePaywall {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ask to upgrade legacy plan into new plan', () => {
        const productsWithLegacyPrice = _cloneDeep(products)
        productsWithLegacyPrice[0].prices.push(legacyBasicHelpdeskPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    legacyBasicHelpdeskPrice.price_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithLegacyPrice,
                    }),
                } as Partial<RootState>)}
            >
                <FeaturePaywall
                    {...minProps}
                    feature={AccountFeature.AutoAssignment}
                    paywallConfigs={{
                        [AccountFeature.AutoAssignment]: defaultPaywallConfig,
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ask to upgrade custom plan when missing feature', () => {
        const productsWithCustomPrice = _cloneDeep(products)
        productsWithCustomPrice[0].prices.push(customHelpdeskPrice)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    customHelpdeskPrice.price_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: productsWithCustomPrice,
                    }),
                } as Partial<RootState>)}
            >
                <FeaturePaywall
                    {...minProps}
                    feature={AccountFeature.OverviewLiveStatistics}
                    paywallConfigs={{
                        [AccountFeature.OverviewLiveStatistics]:
                            defaultPaywallConfig,
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
