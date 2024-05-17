import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import {AchievedAndBreachedTicketsChart} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'
import {RootState, StoreDispatch} from 'state/types'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

import ServiceLevelAgreements, {
    SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
} from 'pages/stats/ServiceLevelAgreements'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

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
jest.mock('pages/stats/sla/components/AchievedAndBreachedTicketsChart')
const AchievedAndBreachedTicketsChartMock = assumeMock(
    AchievedAndBreachedTicketsChart
)
jest.mock('pages/stats/sla/components/AchievementRateTrendCard')
const AchievementRateTrendCardMock = assumeMock(AchievementRateTrendCard)
jest.mock('pages/stats/sla/components/BreachedTicketsRateTrendCard')
const BreachedTicketsRateTrendCardMock = assumeMock(
    BreachedTicketsRateTrendCard
)
jest.mock('pages/stats/sla/components/SLAPolicySelect')
const SLAPolicySelectMock = assumeMock(SLAPolicySelect)

describe('ServiceLevelAgreements', () => {
    beforeEach(() => {
        AchievedAndBreachedTicketsChartMock.mockImplementation(() => <div />)
        AchievementRateTrendCardMock.mockImplementation(() => <div />)
        BreachedTicketsRateTrendCardMock.mockImplementation(() => <div />)
    })

    beforeEach(() => {
        SLAPolicySelectMock.mockImplementation(() => <div />)
    })
    it('should render service level agreements', () => {
        render(
            <Provider store={mockStore({})}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE)
        ).toBeInTheDocument()
        expect(AchievedAndBreachedTicketsChartMock).toHaveBeenCalled()
        expect(AchievementRateTrendCardMock).toHaveBeenCalled()
        expect(BreachedTicketsRateTrendCardMock).toHaveBeenCalled()
    })

    it('should render SLAPolicySelect', () => {
        render(
            <Provider store={mockStore({})}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(SLAPolicySelectMock).toHaveBeenCalled()
    })
})
