import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    CONVERT_PRODUCT_ID,
    convertPlan0,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'
import * as discountedPriceFlagModule from 'pages/convert/common/hooks/useIsProductCardDiscountedPriceEnabled'
import { RootState } from 'state/types'

import CampaignPreview from '../CampaignPreview'

const CAMPAIGN_POSITION = {
    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
    offsetX: 0,
    offsetY: 0,
}

const TEXTS = {
    campaignClickToReply: 'Click to reply',
}

const PRODUCT = {
    id: 1,
    title: 'Product nr1',
    url: 'https://store.com/mock-product1/',
    price: 100,
    compareAtPrice: 120,
    currency: 'USD',
    featured_image: 'https://store.com/mock-product1.png',
}

const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [CONVERT_PRODUCT_ID]: convertPlan0.price_id,
            },
        },
    }),
    billing: fromJS(billingState),
}

const mockStore = configureMockStore()

describe('<CampaignPreview />', () => {
    it('renders the campaign message', () => {
        const { getByText } = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
            />,
        )

        getByText('Jest campaign')
    })

    it('renders the Click to reply if campaign is interactive', () => {
        const { getByText } = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
            />,
        )

        getByText('Click to reply')
    })

    it('does not render the Click to reply if campaign is not interactive', () => {
        const { queryByText } = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
                shouldHideReplyInput={true}
            />,
        )

        expect(queryByText('Click to reply')).toBeNull()
    })

    it('renders product cards with Show details because is not Convert subscriber', () => {
        const { getByText } = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS(account),
                })}
            >
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                />
            </Provider>,
        )

        expect(getByText('Show details')).toBeInTheDocument()
    })

    it('renders product cards with add to cart', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                />
            </Provider>,
        )

        expect(getByText('Add to cart')).toBeInTheDocument()
    })

    it('renders product cards with select options', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[
                        {
                            ...PRODUCT,
                            variant_name: 'Variant 1',
                        },
                    ]}
                />
            </Provider>,
        )

        expect(getByText('Select Options')).toBeInTheDocument()
    })

    it('renders product cards with reposition image', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                />
            </Provider>,
        )

        expect(screen.getByText('Reposition image')).toBeInTheDocument()
    })

    it('renders product cards without reposition image with hide option', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                    shouldHideRepositionImage={true}
                />
            </Provider>,
        )

        expect(screen.queryByText('Reposition image')).not.toBeInTheDocument()
    })

    it('renders product cards with compareAtPrice if discounted price flag is enabled', () => {
        jest.spyOn(
            discountedPriceFlagModule,
            'useIsProductCardDiscountedPriceEnabled',
        ).mockReturnValue(true)

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                />
            </Provider>,
        )

        getByText('$100.00')
        getByText('$120.00')
    })

    it('renders product cards without compareAtPrice if discounted price flag is disabled', () => {
        jest.spyOn(
            discountedPriceFlagModule,
            'useIsProductCardDiscountedPriceEnabled',
        ).mockReturnValue(false)

        const { getByText, queryByText } = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignPreview
                    html="<div>Jest campaign</div>"
                    mainColor="#0d87dd"
                    mainFontFamily="Inter"
                    translatedTexts={TEXTS}
                    position={CAMPAIGN_POSITION}
                    products={[PRODUCT]}
                />
            </Provider>,
        )

        getByText('$100.00')
        const compareAtPrice = queryByText('$120.00')
        expect(compareAtPrice).not.toBeInTheDocument()
    })
})
