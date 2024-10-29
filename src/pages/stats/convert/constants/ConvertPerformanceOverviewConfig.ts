import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import {TooltipData} from 'pages/stats/types'

export const OverviewMetricConfig: Record<
    CampaignsTotalsMetricNames,
    {title: string; hint?: TooltipData}
> = {
    [CampaignsTotalsMetricNames.gmv]: {
        title: 'Total store revenue',
    },
    [CampaignsTotalsMetricNames.influencedRevenueShare]: {
        title: 'Total store revenue share influenced by campaigns',
        hint: {
            title: `Impact of campaigns on your store revenue, calculated as:
        Campaign revenue / Total store revenue`,
        },
    },
    [CampaignsTotalsMetricNames.revenue]: {
        title: 'Campaign revenue',
        hint: {
            title: `Sum of the revenue generated from all campaigns selected,
        from both tickets converted, clicks on campaigns converted,
        and discount codes displayed on campaigns applied to orders.`,
        },
    },
    [CampaignsTotalsMetricNames.impressions]: {
        title: 'Impressions',
        hint: {title: `How often the selected campaigns were displayed.`},
    },
    [CampaignsTotalsMetricNames.engagement]: {
        title: 'Engagement',
        hint: {
            title: `How often shoppers interacted with the selected campaigns.
        Campaign interactions include:
        (1) tickets created after a campaign,
        (2) clicks on a link displayed in a campaign,
        (3) clicks on product recommendations displayed in a campaign
        (clicks on the product link or direct add to cart),
        (4) discount code displayed in a campaign applied to an order,
        (5) submitting an email capture form`,
        },
    },
    [CampaignsTotalsMetricNames.campaignSalesCount]: {
        title: 'Orders',
        hint: {
            title: `Number of orders following one of the interactions counted as an engagement`,
        },
    },
}

export const METRICS = OverviewMetricConfig
