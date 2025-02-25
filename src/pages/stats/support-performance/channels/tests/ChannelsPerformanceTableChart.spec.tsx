import React from 'react'

import { render } from '@testing-library/react'

import { ChannelsCardExtra } from 'pages/stats/support-performance/channels/ChannelsCardExtra'
import { ChannelsPerformanceTableChart } from 'pages/stats/support-performance/channels/ChannelsPerformanceTableChart'
import { ChannelsTable } from 'pages/stats/support-performance/channels/ChannelsTable'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/support-performance/channels/ChannelsTable')
const ChannelsTableMock = assumeMock(ChannelsTable)
jest.mock('pages/stats/support-performance/channels/ChannelsCardExtra')
const ChannelsCardExtraMock = assumeMock(ChannelsCardExtra)

describe('ChannelsPerformanceTableChart', () => {
    beforeEach(() => {
        ChannelsTableMock.mockImplementation(() => <div />)
        ChannelsCardExtraMock.mockImplementation(() => <div />)
    })

    it('Should render channels table', () => {
        render(<ChannelsPerformanceTableChart />)

        expect(ChannelsTableMock).toHaveBeenCalled()
        expect(ChannelsCardExtraMock).toHaveBeenCalled()
    })
})
