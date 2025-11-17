import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { DRILL_DOWN_PER_PAGE } from 'domains/reporting/hooks/useDrillDownData'
import { DrillDownDownloadButton } from 'domains/reporting/pages/common/drill-down/DrillDownDownloadButton'
import { DrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar'
import { getDrillDownConfig } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownDownloadButton')
const DrillDownDownloadButtonMock = assumeMock(DrillDownDownloadButton)

describe('<DrillDownInfobar />', () => {
    const metricData: DrillDownMetric = {
        metricName: OverviewMetric.OpenTickets,
    }
    const totalResults = 50

    const useDrillDownDataMock = jest.fn().mockReturnValue({
        perPage: DRILL_DOWN_PER_PAGE,
        totalResults,
        isFetching: false,
    } as any)

    beforeEach(() => {
        DrillDownDownloadButtonMock.mockImplementation(() => (
            <div data-testid="download" />
        ))
    })

    it('should render the infobar with current number of results', () => {
        render(
            <DrillDownInfoBar
                metricData={metricData}
                useDataHook={useDrillDownDataMock}
                domainConfig={getDrillDownConfig(metricData)}
            />,
        )

        expect(
            screen.getByText(`${totalResults}`, { exact: false }),
        ).toBeInTheDocument()
    })

    it(`should render the Infobar when ${DRILLDOWN_QUERY_LIMIT} results or more`, () => {
        const totalResults = 200
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: false,
        } as any)
        render(
            <DrillDownInfoBar
                metricData={metricData}
                useDataHook={useDrillDownDataMock}
                domainConfig={getDrillDownConfig(metricData)}
            />,
        )

        expect(
            screen.getByText(String(DRILLDOWN_QUERY_LIMIT), { exact: false }),
        ).toBeInTheDocument()
    })

    it('should render "?" as number of rows when fetching', () => {
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: true,
        } as any)

        render(
            <DrillDownInfoBar
                metricData={metricData}
                useDataHook={useDrillDownDataMock}
                domainConfig={getDrillDownConfig(metricData)}
            />,
        )

        expect(
            screen.getByText('Fetching tickets...', { exact: false }),
        ).toBeInTheDocument()
    })

    it('should render the download button when metric data is downloadable', () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: false,
        } as any)

        render(
            <DrillDownInfoBar
                metricData={metricData}
                useDataHook={useDrillDownDataMock}
                domainConfig={getDrillDownConfig(metricData)}
            />,
        )

        expect(screen.getByTestId('download')).toBeInTheDocument()
    })

    it.each([
        VoiceMetric.AverageTalkTime,
        VoiceMetric.AverageWaitTime,
        VoiceMetric.QueueAverageTalkTime,
        VoiceMetric.QueueAverageWaitTime,
        VoiceMetric.QueueInboundCalls,
        VoiceMetric.QueueInboundUnansweredCalls,
        VoiceMetric.QueueInboundMissedCalls,
        VoiceMetric.QueueInboundAbandonedCalls,
        VoiceMetric.QueueOutboundCalls,
        VoiceAgentsMetric.AgentTotalCalls,
        VoiceAgentsMetric.AgentInboundAnsweredCalls,
        VoiceAgentsMetric.AgentInboundMissedCalls,
        VoiceAgentsMetric.AgentOutboundCalls,
        VoiceAgentsMetric.AgentAverageTalkTime,
    ])(
        `should not render the download button when metric data is not downloadable`,
        (metric) => {
            const metricData: DrillDownMetric = {
                metricName: metric,
            } as DrillDownMetric
            useDrillDownDataMock.mockReturnValue({
                perPage: DRILL_DOWN_PER_PAGE,
                totalResults,
                isFetching: false,
            } as any)

            render(
                <DrillDownInfoBar
                    metricData={metricData}
                    useDataHook={useDrillDownDataMock}
                    domainConfig={getDrillDownConfig(metricData)}
                />,
            )

            expect(screen.queryByTestId('download')).toBeNull()
        },
    )

    it.each([
        [ConvertMetric.CampaignSalesCount, 'orders'],
        [VoiceMetric.AverageWaitTime, 'voice calls'],
        [VoiceMetric.AverageTalkTime, 'voice calls'],
        [VoiceMetric.QueueAverageWaitTime, 'voice calls'],
        [VoiceMetric.QueueAverageTalkTime, 'voice calls'],
        [VoiceMetric.QueueInboundCalls, 'voice calls'],
        [VoiceMetric.QueueOutboundCalls, 'voice calls'],
        [VoiceAgentsMetric.AgentAverageTalkTime, 'voice calls'],
        [VoiceAgentsMetric.AgentInboundAnsweredCalls, 'voice calls'],
        [VoiceAgentsMetric.AgentInboundMissedCalls, 'voice calls'],
        [VoiceAgentsMetric.AgentOutboundCalls, 'voice calls'],
        [VoiceAgentsMetric.AgentTotalCalls, 'voice calls'],
    ])('should render the correct object type for %s', (metric, objectType) => {
        const metricData = {
            metricName: metric,
        } as any
        useDrillDownDataMock.mockReturnValue({
            perPage: DRILL_DOWN_PER_PAGE,
            totalResults,
            isFetching: false,
        } as any)

        render(
            <DrillDownInfoBar
                metricData={metricData}
                useDataHook={useDrillDownDataMock}
                domainConfig={getDrillDownConfig(metricData)}
            />,
        )

        expect(
            screen.getByText(objectType, { exact: false }),
        ).toBeInTheDocument()
    })
})
