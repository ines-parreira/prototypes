import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import VoiceStatsNavbarItem from 'pages/stats/voice/components/VoiceStatsNavbar/VoiceStatsNavbarItem'
import {assumeMock, renderWithRouter} from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)
jest.mock(
    'pages/stats/report-chart-restrictions/useReportChartRestrictions',
    () => ({
        useReportChartRestrictions: jest.fn(),
    })
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('<VoiceStatsNavbarItem />', () => {
    const defaultProps = {
        to: 'example.com',
        title: 'Test',
        commonNavLinkProps: {
            exact: true,
        },
    }

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
        } as any)
    })

    it('should render with upgrade icon', () => {
        mockUseAppSelector.mockReturnValue(false)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render with NEW badge', () => {
        mockUseAppSelector.mockReturnValue(true)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} isNew />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('NEW')).toBeInTheDocument()
    })

    it('should render without badge', () => {
        mockUseAppSelector.mockReturnValue(true)
        const {queryByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(queryByText('NEW')).not.toBeInTheDocument()
        expect(queryByText('arrow_circle_up')).not.toBeInTheDocument()
    })
})
