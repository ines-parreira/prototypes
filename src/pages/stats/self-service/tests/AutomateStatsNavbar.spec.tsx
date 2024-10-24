import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {assumeMock, renderWithRouter} from 'utils/testing'

import AutomateStatsNavbar from '../AutomateStatsNavbar'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

describe('<AutomateStatsNavbar />', () => {
    const defaultProps = {
        commonNavLinkProps: {
            exact: true,
        },
    }

    it('should render with upgrade icon when automate is not enabled', () => {
        mockUseAppSelector.mockReturnValue(false)
        const {getByText} = renderWithRouter(
            <AutomateStatsNavbar {...defaultProps} />
        )
        expect(getByText('Overview')).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render the automate stats navbar with the correct items', () => {
        mockFlags({
            [FeatureFlagKey.AIAgentStatsPage]: true,
        })

        mockUseAppSelector.mockReturnValue(true)
        const {getAllByRole} = renderWithRouter(
            <AutomateStatsNavbar {...defaultProps} />
        )

        const links = getAllByRole('link')

        expect(links[0]).toHaveAttribute('href', '/app/stats/automate-overview')
        expect(links[0].textContent).toEqual('Overview')
        expect(links[1]).toHaveAttribute('href', '/app/stats/automate-ai-agent')
        expect(links[1].textContent).toEqual('AI Agent')
        expect(links[2]).toHaveAttribute(
            'href',
            '/app/stats/performance-by-features'
        )
        expect(links[2].textContent).toEqual('Performance by feature')
    })
})
