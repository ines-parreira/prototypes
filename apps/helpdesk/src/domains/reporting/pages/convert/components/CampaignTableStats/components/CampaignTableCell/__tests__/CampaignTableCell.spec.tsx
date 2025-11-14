import { assumeMock } from '@repo/testing'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { CampaignTableCell } from 'domains/reporting/pages/convert/components/CampaignTableStats/components/CampaignTableCell/CampaignTableCell'
import { CampaignTableColumn } from 'domains/reporting/pages/convert/types/CampaignTableColumn'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { CampaignTableValueFormat } from 'domains/reporting/pages/convert/types/enums/CampaignTableValueFormat.enum'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ConvertMetric } from 'domains/reporting/state/ui/stats/types'
import { campaign } from 'fixtures/campaign'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    CampaignPreview,
    InferredCampaignStatus,
} from 'models/convert/campaign/types'
import { GorgiasChatIntegration } from 'models/integration/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
const useAppDispatchMock = assumeMock(useAppDispatch)
useAppDispatchMock.mockReturnValue(dispatchMock)

describe('<CampaignTableCell />', () => {
    const cell = {
        campaign: campaign as CampaignPreview,
        currency: 'USD',
        metrics: {
            conversionRate: 0.5,
        },
        variantMetrics: {},
        chatIntegration: {
            id: '1234',
            name: 'Test integration',
        } as unknown as GorgiasChatIntegration,
        drillDownMetricData: {
            [ConvertMetric.CampaignSalesCount]: {
                title: 'Orders',
                metricName: ConvertMetric.CampaignSalesCount,
                campaignsOperator: LogicalOperatorEnum.ONE_OF,
                shopName: 'shopify:best-shop',
                selectedCampaignIds: [campaign.id],
                context: {
                    channel_connection_external_ids: ['1234'],
                },
            },
        },
    } as CampaignTableContentCell

    it.each([
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Percentage,
            },
            100,
            '100%',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Number,
            },
            123456789,
            '123,456,789',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
                format: CampaignTableValueFormat.Currency,
            },
            1234.12,
            '$1,234.12',
        ],
        [
            {
                key: CampaignTableKeys.ClicksRate,
            },
            'string',
            'string',
        ],
        [
            {
                key: CampaignTableKeys.CampaignName,
            },
            'My cool campaign',
            'My cool campaign',
        ],
    ])(
        'should render the cell with value',
        async (column, value, expectedResult) => {
            const { findByText } = renderWithRouter(
                <CampaignTableCell
                    column={column as CampaignTableColumn}
                    cell={cell}
                    data={value}
                    variantToggleState={{}}
                    setVariantToggleState={jest.fn()}
                />,
            )

            await findByText(expectedResult)
        },
    )

    it('should render campaign name with light campaign label', async () => {
        const { findByText } = renderWithRouter(
            <CampaignTableCell
                column={
                    {
                        key: CampaignTableKeys.CampaignName,
                    } as CampaignTableColumn
                }
                cell={{
                    ...cell,
                    campaign: {
                        ...(campaign as CampaignPreview),
                        is_light: true,
                    },
                }}
                data="Super converting campaign"
                variantToggleState={{}}
                setVariantToggleState={jest.fn()}
            />,
        )

        await findByText('Super converting campaign')
        await findByText('light')
    })

    it.each([
        [InferredCampaignStatus.Active, 'active'],
        [InferredCampaignStatus.Deleted, 'deleted'],
        [InferredCampaignStatus.Inactive, 'inactive'],
    ])('should render campaign status badge', async (status, expectedLabel) => {
        const { findByText } = renderWithRouter(
            <CampaignTableCell
                column={
                    {
                        key: CampaignTableKeys.CampaignCurrentStatus,
                    } as CampaignTableColumn
                }
                cell={cell}
                data={status}
                variantToggleState={{}}
                setVariantToggleState={jest.fn()}
            />,
        )

        await findByText(expectedLabel)
    })

    it('should render drilldown modal on Orders click', async () => {
        const { findByText } = renderWithRouter(
            <CampaignTableCell
                column={
                    {
                        key: CampaignTableKeys.Conversions,
                    } as CampaignTableColumn
                }
                cell={cell}
                data="10"
                variantToggleState={{}}
                setVariantToggleState={jest.fn()}
            />,
        )

        const ordersCount = await findByText('10')
        ordersCount.click()

        expect(dispatchMock).toHaveBeenCalledWith(
            setMetricData(
                expect.objectContaining({
                    metricName: ConvertMetric.CampaignSalesCount,
                    selectedCampaignIds: [campaign.id],
                }),
            ),
        )
    })
})
