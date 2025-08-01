import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { ChannelsCardExtra } from 'domains/reporting/pages/support-performance/channels/ChannelsCardExtra'
import { ChannelsPerformanceTableChart } from 'domains/reporting/pages/support-performance/channels/ChannelsPerformanceTableChart'
import { ChannelsTable } from 'domains/reporting/pages/support-performance/channels/ChannelsTable'

jest.mock('domains/reporting/pages/support-performance/channels/ChannelsTable')
const ChannelsTableMock = assumeMock(ChannelsTable)
jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsCardExtra',
)
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
