import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {PaywallConfig} from '../../../../../config/paywalls'
import {AccountFeature} from '../../../../../state/currentAccount/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../../../../fixtures/subscriptionPlan'
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
        billing: fromJS({
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [proPlan.id]: proPlan,
                [advancedPlan.id]: advancedPlan,
            }),
        }),
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
            minProps,
            {...defaultState, billing: fromJS({})},
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
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            plan: advancedPlan.id,
                        },
                    }),
                    billing: fromJS({
                        plans: {
                            [basicPlan.id]: basicPlan,
                            [proPlan.id]: proPlan,
                            [advancedPlan.id]: {
                                ...advancedPlan,
                                is_legacy: true,
                                public: false,
                            },
                        },
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

    it('should ask to upgrade custom plan when missing feature', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        current_subscription: {
                            plan: advancedPlan.id,
                        },
                    }),
                    billing: fromJS({
                        plans: {
                            [advancedPlan.id]: {...advancedPlan, custom: true},
                        },
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
