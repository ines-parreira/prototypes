import { assumeMock } from '@repo/testing'

import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    CHANNEL_COLUMN_WIDTH,
    DESKTOP_CHANNEL_COLUMN_WIDTH,
    getColumnWidth,
    LeadColumn,
    MOBILE_CHANNEL_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'

jest.mock('pages/common/utils/mobile')

const mockIsMediumOrSmallScreen = assumeMock(isMediumOrSmallScreen)

describe('ChannelsTableConfig', () => {
    describe('getColumnWidth', () => {
        beforeEach(() => {
            mockIsMediumOrSmallScreen.mockReset()
        })

        describe('on mobile/small screens', () => {
            beforeEach(() => {
                mockIsMediumOrSmallScreen.mockReturnValue(true)
            })

            it('should return mobile channel width for Channel column', () => {
                const width = getColumnWidth(ChannelsTableColumns.Channel)

                expect(width).toBe(MOBILE_CHANNEL_COLUMN_WIDTH)
            })

            it('should return mobile channel width for lead column', () => {
                const width = getColumnWidth(LeadColumn)

                expect(width).toBe(MOBILE_CHANNEL_COLUMN_WIDTH)
            })

            it('should return mobile metric width for non-channel columns', () => {
                const nonChannelColumns = [
                    ChannelsTableColumns.TicketsCreated,
                    ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
                    ChannelsTableColumns.CreatedTicketsPercentage,
                    ChannelsTableColumns.ClosedTickets,
                    ChannelsTableColumns.TicketHandleTime,
                    ChannelsTableColumns.FirstResponseTime,
                    ChannelsTableColumns.MedianResponseTime,
                    ChannelsTableColumns.MedianResolutionTime,
                    ChannelsTableColumns.TicketsReplied,
                    ChannelsTableColumns.MessagesSent,
                    ChannelsTableColumns.CustomerSatisfaction,
                    ChannelsTableColumns.MessagesReceived,
                ]

                nonChannelColumns.forEach((column) => {
                    const width = getColumnWidth(column)
                    expect(width).toBe(MOBILE_METRIC_COLUMN_WIDTH)
                })
            })

            it('should return mobile metric width for HumanResponseTimeAfterAiHandoff column', () => {
                const width = getColumnWidth(
                    ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
                )

                expect(width).toBe(MOBILE_METRIC_COLUMN_WIDTH)
            })
        })

        describe('on desktop/large screens', () => {
            beforeEach(() => {
                mockIsMediumOrSmallScreen.mockReturnValue(false)
            })

            it('should return desktop channel width for Channel column', () => {
                const width = getColumnWidth(ChannelsTableColumns.Channel)

                expect(width).toBe(CHANNEL_COLUMN_WIDTH)
            })

            it('should return desktop channel width for lead column', () => {
                const width = getColumnWidth(LeadColumn)

                expect(width).toBe(CHANNEL_COLUMN_WIDTH)
            })

            it('should return desktop channel width for HumanResponseTimeAfterAiHandoff column', () => {
                const width = getColumnWidth(
                    ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
                )

                expect(width).toBe(DESKTOP_CHANNEL_COLUMN_WIDTH)
            })

            it('should return standard metric width for other metric columns', () => {
                const standardMetricColumns = [
                    ChannelsTableColumns.TicketsCreated,
                    ChannelsTableColumns.CreatedTicketsPercentage,
                    ChannelsTableColumns.ClosedTickets,
                    ChannelsTableColumns.TicketHandleTime,
                    ChannelsTableColumns.FirstResponseTime,
                    ChannelsTableColumns.MedianResponseTime,
                    ChannelsTableColumns.MedianResolutionTime,
                    ChannelsTableColumns.TicketsReplied,
                    ChannelsTableColumns.MessagesSent,
                    ChannelsTableColumns.CustomerSatisfaction,
                    ChannelsTableColumns.MessagesReceived,
                ]

                standardMetricColumns.forEach((column) => {
                    const width = getColumnWidth(column)
                    expect(width).toBe(METRIC_COLUMN_WIDTH)
                })
            })
        })
    })
})
