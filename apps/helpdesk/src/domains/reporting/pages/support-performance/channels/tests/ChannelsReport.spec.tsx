import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import type { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import type FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { ChannelsReport } from 'domains/reporting/pages/support-performance/channels/ChannelsReport'
import {
    CHANNEL_REPORT_OPTIONAL_FILTERS,
    CHANNELS_REPORT_PAGE_TITLE,
} from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import {
    channelsSlice,
    initialState,
} from 'domains/reporting/state/ui/stats/channelsSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModalTrigger.tsx',
    () => ({
        DrillDownModalTrigger: ({
            children,
        }: ComponentProps<typeof DrillDownModalTrigger>) => children,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsDownloadDataButton',
    () => ({
        ChannelsDownloadDataButton: () => <div />,
    }),
)
jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsHeaderCellContent',
    () => ({
        ChannelsHeaderCellContent: () => <div />,
    }),
)
jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsTable',
    () => ({
        ChannelsTable: () => <div />,
    }),
)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

describe('ChannelsReport', () => {
    const defaultState = {
        ui: {
            stats: { [channelsSlice.name]: initialState },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        ChartsActionMenuMock.mockReturnValue((() => <div />) as any)
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
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
