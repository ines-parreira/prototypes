import React from 'react'

import { render, screen } from '@testing-library/react'

import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { assumeMock } from 'utils/testing'

import {
    ConnectedChannelsInfoAlert,
    EmptyHelpCenterAlert,
    ManyHelpCentersAlert,
    NoHelpCenterAlert,
} from '../ArticleRecommendationAlerts'

jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)

describe('ArticleRecommendationAlerts', () => {
    beforeEach(() => {
        useIsAutomateSettingsMock.mockReturnValue(false)
    })

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
    it('should render when in automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)
        render(
            <ConnectedChannelsInfoAlert
                shopName="shop-name"
                shopType="shopify"
            />,
        )

        expect(screen.getByText('Channels')).toBeInTheDocument()
    })
})
