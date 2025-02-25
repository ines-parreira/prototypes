import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    ConnectedChannelsInfoAlert,
    EmptyHelpCenterAlert,
    ManyHelpCentersAlert,
    NoHelpCenterAlert,
} from '../ArticleRecommendationAlerts'

describe('ArticleRecommendationAlerts', () => {
    it('should render <NoHelpCenterAlert />', () => {
        render(<NoHelpCenterAlert />)

        expect(
            screen.getByText(/create a help center and add articles/i),
        ).toBeInTheDocument()
    })
    it('should render <ManyHelpCentersAlert />', () => {
        render(<ManyHelpCentersAlert shopName="shop-name" shopType="shopify" />)

        expect(
            screen.getByText(/make sure the desired help center/i),
        ).toBeInTheDocument()
    })
    it('should render <EmptyHelpCenterAlert />', () => {
        render(<EmptyHelpCenterAlert helpCenterId={1} />)

        expect(screen.getByText(/go to help center/i)).toBeInTheDocument()
    })
    it('should render <ConnectedChannelsInfoAlert />', () => {
        render(
            <ConnectedChannelsInfoAlert
                shopName="shop-name"
                shopType="shopify"
            />,
        )

        expect(screen.getByText(/control where customer/i)).toBeInTheDocument()
    })
})
