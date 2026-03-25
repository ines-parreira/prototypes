import type { ComponentProps } from 'react'

import { resetLDMocks } from '@repo/feature-flags/testing'
import { fromJS } from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { PaywallConfig } from 'config/paywalls'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    customHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
} from 'fixtures/plans'
import type { AvailablePlansOf, ProductType } from 'models/billing/types'
import { AccountFeature } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

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
        resetLDMocks()
    })

    it.each<
        [string, ComponentProps<typeof FeaturePaywall>, Partial<RootState>]
    >([
        [
            'paywall config is undefined',
            { ...minProps, feature: AccountFeature.SatisfactionSurveys },
            defaultState,
        ],
        [
            'required price name was not found',
            { ...minProps, feature: AccountFeature.Api1stPartyRateLimit },
            defaultState,
        ],
    ])('should render empty page when %s', (testName, props, state) => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(state)}>
                <FeaturePaywall {...props} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render paywall for the feature', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <FeaturePaywall {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ask to upgrade legacy plan into new plan', () => {
        const availablePlansWithLegacyPlans = _cloneDeep(products)
        const helpdeskProduct =
            availablePlansWithLegacyPlans[0] as AvailablePlansOf<ProductType.Helpdesk>
        helpdeskProduct.prices.push(legacyBasicHelpdeskPlan)

        const { container } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    legacyBasicHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: availablePlansWithLegacyPlans,
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
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ask to upgrade custom plan when missing feature', () => {
        const availablePlanWithCustomPlan = _cloneDeep(products)
        const helpdeskProduct =
            availablePlanWithCustomPlan[0] as AvailablePlansOf<ProductType.Helpdesk>
        helpdeskProduct.prices.push(customHelpdeskPlan)

        const { container } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    customHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                    billing: fromJS({
                        ...billingState,
                        products: availablePlanWithCustomPlan,
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
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
