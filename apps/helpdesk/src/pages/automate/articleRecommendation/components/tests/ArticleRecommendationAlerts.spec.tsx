import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { renderWithRouter } from 'utils/testing'

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
        renderWithRouter(<NoHelpCenterAlert />)

        expect(
            screen.getByText(/create a help center and add articles/i),
        ).toBeInTheDocument()
    })
    it('should render <ManyHelpCentersAlert />', () => {
        renderWithRouter(
            <ManyHelpCentersAlert shopName="shop-name" shopType="shopify" />,
        )

        expect(
            screen.getByText(/make sure the desired help center/i),
        ).toBeInTheDocument()
    })
    it('should render <EmptyHelpCenterAlert />', () => {
        renderWithRouter(<EmptyHelpCenterAlert helpCenterId={1} />)

        expect(screen.getByText(/go to help center/i)).toBeInTheDocument()
    })
    it('should render <ConnectedChannelsInfoAlert />', () => {
        renderWithRouter(
            <ConnectedChannelsInfoAlert
                shopName="shop-name"
                shopType="shopify"
            />,
        )

        expect(screen.getByText(/control where customer/i)).toBeInTheDocument()
    })
    it('should render when in automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)
        renderWithRouter(
            <ConnectedChannelsInfoAlert
                shopName="shop-name"
                shopType="shopify"
            />,
        )

        expect(screen.getByText('Channels')).toBeInTheDocument()
    })
})
