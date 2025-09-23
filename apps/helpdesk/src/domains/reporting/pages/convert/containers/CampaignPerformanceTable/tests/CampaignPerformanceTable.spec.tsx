import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'
import routerDom, { useParams } from 'react-router-dom'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { CampaignPerformanceEditColumns } from 'domains/reporting/pages/convert/components/CampaignPerformanceEditColumns'
import { CAMPAIGN_TABLE_COLUMN_TITLES } from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { CampaignPerformanceTable } from 'domains/reporting/pages/convert/containers/CampaignPerformanceTable/CampaignPerformanceTable'
import { useGetTableStat } from 'domains/reporting/pages/convert/hooks/stats/useGetTableStat'
import { useCampaignPerformanceTableSetting } from 'domains/reporting/pages/convert/hooks/useCampaignPerformanceTableSetting'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { TableView } from 'domains/reporting/state/ui/stats/types'
import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import * as useIsConvertPerformanceViewEnabled from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import { renderWithStore } from 'utils/testing'

jest.mock('core/flags/hooks/useAreFlagsLoading', () => () => false)

jest.mock('domains/reporting/pages/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock(
    'domains/reporting/pages/convert/components/CampaignPerformanceEditColumns',
)
const CampaignPerformanceEditColumnsMock = assumeMock(
    CampaignPerformanceEditColumns,
)

jest.mock(
    'domains/reporting/pages/convert/hooks/useCampaignPerformanceTableSetting',
)
const useCampaignPerformanceTableSettingMock = assumeMock(
    useCampaignPerformanceTableSetting,
)

jest.mock('domains/reporting/pages/convert/hooks/stats/useGetTableStat')
const useGetTableStatMock = assumeMock(useGetTableStat)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

describe('CampaignPerformanceTable', () => {
    beforeEach(() => {
        CampaignPerformanceEditColumnsMock.mockImplementation(() => <div />)
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
            selectedIntegrations: [shopifyIntegration.id],
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            selectedCampaignIds: [],
            campaigns: [campaign],
        } as any)

        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        useGetTableStatMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {},
        })
        useCampaignPerformanceTableSettingMock.mockReturnValue({
            isLoading: false,
            currentView: {} as TableView<CampaignTableKeys, never>,
            columnsOrder: Object.keys(
                CAMPAIGN_TABLE_COLUMN_TITLES,
            ) as CampaignTableKeys[],
            submitActiveView: jest.fn(),
        })
    })

    it('should render and call stats', () => {
        renderWithStore(<CampaignPerformanceTable />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetTableStatMock).toHaveBeenCalledTimes(2)
    })

    it('should render Edit Columns control when ConvertPerformanceViewEnabled', () => {
        jest.spyOn(
            useIsConvertPerformanceViewEnabled,
            'useIsConvertPerformanceViewEnabled',
        ).mockImplementation(() => true)

        renderWithStore(<CampaignPerformanceTable />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(CampaignPerformanceEditColumnsMock).toHaveBeenCalled()
    })
})
