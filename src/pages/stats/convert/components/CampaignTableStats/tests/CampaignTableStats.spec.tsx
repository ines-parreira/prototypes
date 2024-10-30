import {fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {campaign, campaignVariant} from 'fixtures/campaign'
import {integrationsState} from 'fixtures/integrations'
import {CampaignPreview} from 'models/convert/campaign/types'
import {GorgiasChatIntegration} from 'models/integration/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {CampaignTableStats} from 'pages/stats/convert/components/CampaignTableStats/CampaignTableStats'
import {CAMPAIGN_TABLE_COLUMN_TITLES} from 'pages/stats/convert/components/CampaignTableStats/constants'
import {useCampaignPerformanceTableSetting} from 'pages/stats/convert/hooks/useCampaignPerformanceTableSetting'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {ConvertMetric, TableView} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

const chatIntegration = {
    type: 'gorgias_chat',
    id: '8',
}

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/useCampaignPerformanceTableSetting')
const useCampaignPerformanceTableSettingMock = assumeMock(
    useCampaignPerformanceTableSetting
)

describe('CampaignTableStats', () => {
    const rows = [
        {
            campaign: campaign as CampaignPreview,
            chatIntegration:
                chatIntegration as unknown as GorgiasChatIntegration,
            currency: 'USD',
            metrics: {
                [CampaignTableKeys.TotalRevenue]: 123,
            },
            variantMetrics: {
                [campaignVariant.id]: {
                    [CampaignTableKeys.TotalRevenue]: 456,
                },
            },
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            drillDownMetricData: {
                [ConvertMetric.CampaignSalesCount]: {
                    title: 'test',
                    metricName: ConvertMetric.CampaignSalesCount,
                    campaignsOperator: LogicalOperatorEnum.ONE_OF,
                    shopName: 'test-store',
                    selectedCampaignIds: [campaign.id],
                    context: {
                        channel_connection_external_ids: ['31'],
                    },
                },
            },
        },
    ]

    beforeEach(() => {
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
        } as any)
        useCampaignPerformanceTableSettingMock.mockReturnValue({
            isLoading: false,
            currentView: {} as TableView<CampaignTableKeys>,
            columnsOrder: Object.keys(
                CAMPAIGN_TABLE_COLUMN_TITLES
            ) as CampaignTableKeys[],
            submitActiveView: jest.fn(),
        })
    })

    it('should render CampaignTableStats with campaigns and variants', () => {
        const {getByText, getByRole} = renderWithStore(
            <CampaignTableStats
                chatIntegrationId={8}
                isLoading={false}
                rows={rows}
                offset={0}
                onClickNextPage={jest.fn()}
                onClickPrevPage={jest.fn()}
            />,
            {
                integrations: fromJS(integrationsState),
            }
        )

        expect(getByText(campaign.name)).toBeInTheDocument()
        expect(getByText('$123.00')).toBeInTheDocument()

        const toggle = getByRole('button')
        fireEvent.click(toggle)

        expect(getByText('Variant A')).toBeInTheDocument()
        expect(getByText('$456.00')).toBeInTheDocument()
    })

    it('should render the sorting arrow indicators properly when clicking header cell', () => {
        const {getByText} = renderWithStore(
            <CampaignTableStats
                chatIntegrationId={8}
                isLoading={false}
                rows={rows}
                offset={0}
                onClickNextPage={jest.fn()}
                onClickPrevPage={jest.fn()}
            />,
            {}
        )
        const engagementSpan = getByText('Engagement')
        const engagementTh = engagementSpan.closest('th')!
        const arrowIcon = engagementTh.querySelector(
            'i[class*="directionIcon"]'
        )!
        expect(arrowIcon).toBeInTheDocument()

        fireEvent.click(engagementTh)

        expect(arrowIcon.textContent).toBe('arrow_upward')
        expect(arrowIcon).not.toHaveStyle({display: 'none'})

        fireEvent.click(engagementTh)

        expect(arrowIcon.textContent).toBe('arrow_downward')
        expect(arrowIcon).not.toHaveStyle({display: 'none'})

        fireEvent.click(engagementTh)

        expect(arrowIcon.textContent).toBe('arrow_upward')
        expect(arrowIcon).not.toHaveStyle({display: 'none'})
    })

    it('scroll sets isTableScrolled state correctly', () => {
        const {container, getByText} = renderWithStore(
            <CampaignTableStats
                chatIntegrationId={8}
                isLoading={false}
                rows={rows}
                offset={0}
                onClickNextPage={jest.fn()}
                onClickPrevPage={jest.fn()}
            />,
            {}
        )
        const tableDiv = container.querySelector('.container')

        // Simulate scroll to the right
        fireEvent.scroll(tableDiv as HTMLElement, {target: {scrollLeft: 100}})
        expect(getByText('Campaign name')).toBeInTheDocument()

        const closestThElement = getByText('Campaign name').closest('th')!
        expect(closestThElement).toHaveClass('withShadow')
    })
})
