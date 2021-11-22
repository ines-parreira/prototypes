import React, {ComponentProps} from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import Paywall from '../Paywall'
import {PaywallConfig} from '../../../../../config/paywalls'
import {AccountFeature} from '../../../../../state/currentAccount/types'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../../../../fixtures/subscriptionPlan'

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

describe('<Paywall />', () => {
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
        header: 'Paywall header',
        description: 'Paywall description',
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
    }

    const minProps: ComponentProps<typeof Paywall> = {
        feature: AccountFeature.RevenueStatistics,
        paywallConfigs: {
            [AccountFeature.RevenueStatistics]: defaultPaywallConfig,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it.each<[string, ComponentProps<typeof Paywall>, Partial<RootState>]>([
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
    ])(
        'should render the empty container when %s',
        (testName, props, state) => {
            const {container} = render(
                <Provider store={mockStore(state)}>
                    <Paywall {...props} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render paywall screen for the feature', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Paywall {...minProps} />
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
                            [advancedPlan.id]: {...advancedPlan, public: false},
                        },
                    }),
                } as Partial<RootState>)}
            >
                <Paywall
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
                <Paywall
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

    it('should render a page header for the feature with a page header', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Paywall
                    {...minProps}
                    paywallConfigs={{
                        [AccountFeature.RevenueStatistics]: {
                            ...defaultPaywallConfig,
                            pageHeader: 'Feature page header',
                        },
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render lightbox for the feature with a preview', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Paywall
                    {...minProps}
                    paywallConfigs={{
                        [AccountFeature.RevenueStatistics]: {
                            ...defaultPaywallConfig,
                            preview: `/static/private/img/paywalls/screens/paywall.png`,
                        },
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open the lightbox on preview click', () => {
        const {getByAltText, queryAllByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <Paywall
                    {...minProps}
                    paywallConfigs={{
                        [AccountFeature.RevenueStatistics]: {
                            ...defaultPaywallConfig,
                            preview: `/static/private/img/paywalls/screens/paywall.png`,
                        },
                    }}
                />
            </Provider>
        )

        fireEvent.click(getByAltText('Feature preview'))

        expect(queryAllByTestId('lightbox-opened')).not.toBe(null)
    })

    it.each<[string, (result: RenderResult) => void]>([
        [
            'close click',
            ({getByTestId}) => {
                fireEvent.click(getByTestId('close-button'))
            },
        ],
        [
            'image click',
            ({getByTestId}) => {
                fireEvent.click(getByTestId('click-image-button'))
            },
        ],
    ])('should close the lightbox on %s', (testName, fireCloseEvent) => {
        const renderResult = render(
            <Provider store={mockStore(defaultState)}>
                <Paywall
                    {...minProps}
                    paywallConfigs={{
                        [AccountFeature.RevenueStatistics]: {
                            ...defaultPaywallConfig,
                            preview: `/static/private/img/paywalls/screens/paywall.png`,
                        },
                    }}
                />
            </Provider>
        )

        fireEvent.click(renderResult.getByAltText('Feature preview'))
        fireCloseEvent(renderResult)

        expect(renderResult.queryAllByTestId('lightbox-closed')).not.toBe(null)
    })
})
