import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import * as useAreConvertLightCampaignsEnabled from 'pages/convert/common/hooks/useAreConvertLightCampaignsEnabled'
import LightCampaignBadge from '../LightCampaignBadge'

describe('LightCampaignBadge', () => {
    const lightCampaignsEnabledFlagSpy = jest.spyOn(
        useAreConvertLightCampaignsEnabled,
        'useAreConvertLightCampaignsEnabled'
    )
    const campaign = {
        is_light: true,
    } as Campaign
    const integration = fromJS({
        meta: {
            shop_type: 'shopify',
        },
    })

    beforeEach(() => {
        lightCampaignsEnabledFlagSpy.mockImplementation(() => true)
    })

    it('should render', () => {
        const {getByText} = render(
            <LightCampaignBadge campaign={campaign} integration={integration} />
        )

        expect(getByText('light')).toBeInTheDocument()
    })

    it('should not render if feature flag is not enabled', () => {
        lightCampaignsEnabledFlagSpy.mockImplementation(() => false)

        const {queryByText} = render(
            <LightCampaignBadge campaign={campaign} integration={integration} />
        )

        expect(queryByText('light')).not.toBeInTheDocument()
    })

    it('should not render if campaign is not light', () => {
        const notLightCampaign = {
            is_light: false,
        } as Campaign

        const {queryByText} = render(
            <LightCampaignBadge
                campaign={notLightCampaign}
                integration={integration}
            />
        )

        expect(queryByText('light')).not.toBeInTheDocument()
    })

    it('should not render if integration is not Shopify', () => {
        const notShopifyIntegration = fromJS({
            meta: {
                shop_type: 'bigcommerce',
            },
        })

        const {queryByText} = render(
            <LightCampaignBadge
                campaign={campaign}
                integration={notShopifyIntegration}
            />
        )

        expect(queryByText('light')).not.toBeInTheDocument()
    })
})
