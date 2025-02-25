import React from 'react'

import { act, fireEvent, waitFor } from '@testing-library/react'

import { channels as mockChannels } from 'fixtures/channels'
import { useSortedChannelsWithData } from 'hooks/reporting/support-performance/useSortedChannelsWithData'
import { ChannelsCellContent } from 'pages/stats/support-performance/channels/ChannelsCellContent'
import { ChannelsHeaderCellContent } from 'pages/stats/support-performance/channels/ChannelsHeaderCellContent'
import { ChannelsTable } from 'pages/stats/support-performance/channels/ChannelsTable'
import {
    columnsOrder,
    MOBILE_CHANNEL_COLUMN_WIDTH,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { assumeMock, renderWithStore, triggerWidthResize } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useSortedChannelsWithData')
const useSortedChannelsWithDataMock = assumeMock(useSortedChannelsWithData)

jest.mock('pages/stats/support-performance/channels/ChannelsCellContent')
const ChannelsCellContentMock = assumeMock(ChannelsCellContent)

jest.mock('pages/stats/support-performance/channels/ChannelsHeaderCellContent')
const ChannelsHeaderCellContentMock = assumeMock(ChannelsHeaderCellContent)

describe('<ChannelsTable />', () => {
    beforeEach(() => {
        ChannelsCellContentMock.mockImplementation(() => <div />)
        ChannelsHeaderCellContentMock.mockImplementation(() => <div />)
        useSortedChannelsWithDataMock.mockReturnValue({
            channels: mockChannels,
            isLoading: false,
        })
    })

    it('should render Channels metrics', () => {
        renderWithStore(<ChannelsTable />, {})

        mockChannels.forEach((channel) => {
            columnsOrder.forEach((column) => {
                expect(ChannelsCellContentMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        channel,
                        column,
                    }),
                    {},
                )
            })
        })
    })

    it('should render Channels metrics on mobile', () => {
        triggerWidthResize(500)
        renderWithStore(<ChannelsTable />, {})

        expect(ChannelsCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                width: MOBILE_CHANNEL_COLUMN_WIDTH,
            }),
            {},
        )
    })

    it('should handle table scrolling', async () => {
        renderWithStore(<ChannelsTable />, {})

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(ChannelsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    className: expect.stringMatching('withShadow'),
                }),
                {},
            )
        })
    })

    it('should handle table scrolling to the left border', async () => {
        renderWithStore(<ChannelsTable />, {})
        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
        })

        await waitFor(() => {
            expect(ChannelsHeaderCellContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    className: expect.not.stringMatching('withShadow'),
                }),
                {},
            )
        })
    })
})
