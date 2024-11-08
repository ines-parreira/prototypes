import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {
    ChannelsReport,
    CHANNELS_REPORT_PAGE_TITLE,
    CHANNEL_REPORT_OPTIONAL_FILTERS,
} from 'pages/stats/support-performance/channels/ChannelsReport'
import {RootState} from 'state/types'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'
import {renderWithStore} from 'utils/testing'

const componentMock = () => <div />
const defaultFiltersText = 'default_filters'

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
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)
jest.mock(
    'pages/stats/support-performance/channels/ChannelsDownloadDataButton',
    () => ({
        ChannelsDownloadDataButton: componentMock,
    })
)
jest.mock(
    'pages/stats/support-performance/channels/ChannelsHeaderCellContent',
    () => ({
        ChannelsHeaderCellContent: componentMock,
    })
)
jest.mock('pages/stats/support-performance/channels/ChannelsTable', () => ({
    ChannelsTable: componentMock,
}))

describe('ChannelsReport', () => {
    const defaultState = {
        ui: {
            stats: {[channelsSlice.name]: initialState},
        },
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
            [FeatureFlagKey.AutoQAFilters]: false,
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
        CHANNEL_REPORT_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(queryByText(optionalFilter)).not.toBeInTheDocument()
        })
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
        CHANNEL_REPORT_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should render channels report component with filters panel, default optional filters and a Score filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })
        const extendedChannelsReportFilters = [
            ...CHANNEL_REPORT_OPTIONAL_FILTERS,
            FilterKey.Score,
        ]

        const {getByText} = renderWithStore(<ChannelsReport />, defaultState)

        extendedChannelsReportFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should render channels report component with filters panel, default optional filters and a Resolution Completeness and Communication Skills filters', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
        const extendedChannelsReportFilters = [
            ...CHANNEL_REPORT_OPTIONAL_FILTERS,
            FilterKey.ResolutionCompleteness,
            FilterKey.CommunicationSkills,
        ]

        const {getByText} = renderWithStore(<ChannelsReport />, defaultState)

        extendedChannelsReportFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })
})
