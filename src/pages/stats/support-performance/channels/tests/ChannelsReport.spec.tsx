import React, {ComponentProps} from 'react'
import ChannelsReport, {
    CHANNELS_REPORT_PAGE_TITLE,
} from 'pages/stats/support-performance/channels/ChannelsReport'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {RootState} from 'state/types'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'
import {renderWithStore} from 'utils/testing'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))
jest.mock(
    'pages/stats/support-performance/channels/ChannelsHeaderCellContent.tsx',
    () => ({
        ChannelsHeaderCellContent: () => <div />,
    })
)

describe('ChannelsReport', () => {
    const defaultState = {
        ui: {
            [channelsSlice.name]: initialState,
        },
    } as RootState

    it('should render channels report component', () => {
        const {getByText} = renderWithStore(<ChannelsReport />, defaultState)

        expect(getByText(CHANNELS_REPORT_PAGE_TITLE)).toBeInTheDocument()
    })
})
