import React, { ComponentProps } from 'react'

import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import { ChannelsReport } from 'pages/stats/support-performance/channels/ChannelsReport'
import {
    CHANNEL_REPORT_OPTIONAL_FILTERS,
    CHANNELS_REPORT_PAGE_TITLE,
} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import { RootState } from 'state/types'
import { channelsSlice, initialState } from 'state/ui/stats/channelsSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

const componentMock = () => <div />

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'pages/stats/support-performance/channels/ChannelsDownloadDataButton',
    () => ({
        ChannelsDownloadDataButton: componentMock,
    }),
)
jest.mock(
    'pages/stats/support-performance/channels/ChannelsHeaderCellContent',
    () => ({
        ChannelsHeaderCellContent: componentMock,
    }),
)
jest.mock('pages/stats/support-performance/channels/ChannelsTable', () => ({
    ChannelsTable: componentMock,
}))
jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

describe('ChannelsReport', () => {
    const defaultState = {
        ui: {
            stats: { [channelsSlice.name]: initialState },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        ChartsActionMenuMock.mockReturnValue(componentMock as any)
    })

    it('should render channels report component', () => {
        const { getByText } = renderWithStore(<ChannelsReport />, defaultState)

        expect(getByText(CHANNELS_REPORT_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should render channels report component with filters panel', () => {
        const { getByText } = renderWithStore(<ChannelsReport />, defaultState)

        CHANNEL_REPORT_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should render channels report component with filters panel, default optional filters and a Score filter', () => {
        const extendedChannelsReportFilters = [
            ...CHANNEL_REPORT_OPTIONAL_FILTERS,
        ]

        const { getByText } = renderWithStore(<ChannelsReport />, defaultState)

        extendedChannelsReportFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
        expect(useCleanStatsFiltersMock).toHaveBeenCalled()
    })

    it('should render channels report component with filters panel, default optional filters and a Resolution Completeness and Communication Skills filters', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.price_id,
                    },
                    status: 'active',
                },
            }),
        }
        const extendedChannelsReportFilters = [
            ...CHANNEL_REPORT_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]

        const { getByText } = renderWithStore(<ChannelsReport />, state)

        extendedChannelsReportFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })
})
