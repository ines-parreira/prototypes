import React from 'react'

import { screen } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView'
import { assumeMock, renderWithRouterAndDnD } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('VoiceOfCustomerNavbarView', () => {
    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        } as any)
    })

    it('should render without crashing', () => {
        renderWithRouterAndDnD(<VoiceOfCustomerNavbarView />)

        expect(
            screen.getByText(VOICE_OF_CUSTOMER_SECTION_NAME),
        ).toBeInTheDocument()
    })
})
