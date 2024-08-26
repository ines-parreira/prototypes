import React, {ComponentProps} from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {
    ChannelsReport,
    CHANNELS_REPORT_PAGE_TITLE,
} from 'pages/stats/support-performance/channels/ChannelsReport'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {RootState} from 'state/types'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'
import {renderWithStore} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'

const defaultFiltersText = 'default_filters'
const filtersPanelText = 'filters_panel'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: ({hidden = false}: {hidden: boolean}) =>
        hidden ? null : <div>{defaultFiltersText}</div>,
}))
jest.mock('pages/stats/common/filters/FiltersPanel', () => ({
    FiltersPanel: () => <div>{filtersPanelText}</div>,
}))
jest.mock(
    'pages/stats/support-performance/channels/ChannelsDownloadDataButton',
    () => ({
        ChannelsDownloadDataButton: () => <div />,
    })
)
jest.mock(
    'pages/stats/support-performance/channels/ChannelsHeaderCellContent',
    () => ({
        ChannelsHeaderCellContent: () => <div />,
    })
)
jest.mock('pages/stats/support-performance/channels/ChannelsTable', () => ({
    ChannelsTable: () => <div />,
}))

describe('ChannelsReport', () => {
    const defaultState = {
        ui: {
            [channelsSlice.name]: initialState,
        },
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        })
    })

    it('should render channels report component', () => {
        const {getByText} = renderWithStore(<ChannelsReport />, defaultState)

        expect(getByText(CHANNELS_REPORT_PAGE_TITLE)).toBeInTheDocument()
    })

    it('should render channels report component with default filters', () => {
        const {getByText, queryByText} = renderWithStore(
            <ChannelsReport />,
            defaultState
        )

        expect(getByText(defaultFiltersText)).toBeInTheDocument()
        expect(queryByText(filtersPanelText)).not.toBeInTheDocument()
    })

    it('should render channels report component with filters panel', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
        const {getByText, queryByText} = renderWithStore(
            <ChannelsReport />,
            defaultState
        )

        expect(queryByText(defaultFiltersText)).not.toBeInTheDocument()
        expect(getByText(filtersPanelText)).toBeInTheDocument()
    })
})
