import React from 'react'
import {render, screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import SupportPerformanceTicketInsights, {
    TICKET_INSIGHTS_PAGE_TITLE,
} from 'pages/stats/SupportPerformanceTicketInsights'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'

import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)

jest.mock('pages/stats/CustomFieldSelect.tsx')
const CustomFieldSelectMock = assumeMock(CustomFieldSelect)

jest.mock('pages/stats/TicketDistributionTable.tsx')
const TicketDistributionTableMock = assumeMock(TicketDistributionTable)
jest.mock('pages/stats/TicketInsightsFieldTrend.tsx')
const TicketInsightsFieldTrendMock = assumeMock(TicketInsightsFieldTrend)
const componentMock = () => <div />

describe('<SupportPerformanceTicketInsights />', () => {
    beforeEach(() => {
        SupportPerformanceFiltersMock.mockImplementation(componentMock)
        CustomFieldSelectMock.mockImplementation(componentMock)
        TicketDistributionTableMock.mockImplementation(componentMock)
        TicketInsightsFieldTrendMock.mockImplementation(componentMock)
    })
    it('should render the page title', () => {
        render(<SupportPerformanceTicketInsights />)
        const title = screen.getByText(TICKET_INSIGHTS_PAGE_TITLE)

        expect(title).toBeInTheDocument()
    })

    it('should render the Filters', () => {
        render(<SupportPerformanceTicketInsights />)

        expect(SupportPerformanceFiltersMock).toHaveBeenCalled()
    })

    it('should render the CustomFieldSelect', () => {
        render(<SupportPerformanceTicketInsights />)

        expect(CustomFieldSelectMock).toHaveBeenCalled()
    })

    it('should render the TicketDistributionTable', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsTicketInsightsTopFields]: true,
        }))
        render(<SupportPerformanceTicketInsights />)

        expect(TicketDistributionTableMock).toHaveBeenCalled()
    })
    it('should render the TicketInsightsFieldTrend', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsTicketInsightsFieldTrends]: true,
        }))
        render(<SupportPerformanceTicketInsights />)

        expect(TicketInsightsFieldTrendMock).toHaveBeenCalled()
    })
})
