import {render, screen} from '@testing-library/react'

import React from 'react'

import AiSalesAgentSalesOverview from '../AiSalesAgentSalesOverview'

jest.mock(
    'hooks/useAppSelector',
    () =>
        (fn: () => any): any =>
            fn()
)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper', () => () => (
    <div>filters-panel</div>
))

jest.mock('pages/stats/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

jest.mock('pages/stats/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

describe('AiSalesAgentSalesOverview', () => {
    const renderComponent = () => {
        render(<AiSalesAgentSalesOverview />)
    }
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('AI Agent Sales Overview')).toBeInTheDocument()
    })
})
