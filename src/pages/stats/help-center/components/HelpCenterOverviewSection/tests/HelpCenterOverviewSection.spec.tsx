import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HelpCenterOverviewSection from '../HelpCenterOverviewSection'

jest.mock('../../../hooks/useHelpCenterTrend', () => ({
    useHelpCenterTrend: () => ({data: {value: 1}, isFetching: false}),
}))

const defaultStatsFilters = {
    period: {
        end_datetime: new Date().toString(),
        start_datetime: new Date('01/08/2023').toString(),
    },
}

const renderComponent = () => {
    render(
        <HelpCenterOverviewSection
            statsFilters={defaultStatsFilters}
            timezone="US"
        />
    )
}

describe('<HelpCenterOverviewSection />', () => {
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('should hide tips', () => {
        renderComponent()

        expect(screen.getByTestId('article-tip')).toBeInTheDocument()
        expect(screen.getByTestId('searches-tip')).toBeInTheDocument()

        userEvent.click(screen.getByText('Hide tips'))

        expect(screen.queryByTestId('article-tip')).not.toBeInTheDocument()
        expect(screen.queryByTestId('searches-tip')).not.toBeInTheDocument()
    })
})
