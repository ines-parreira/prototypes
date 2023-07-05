import React from 'react'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {LEARN_MORE_URL} from 'pages/stats/SupportPerformanceOverview'
import SupportPerformanceAgents, {
    AGENTS_PAGE_TITLE,
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENT_PERFORMANCE_LEGACY_PATH,
} from '../SupportPerformanceAgents'
jest.unmock('react-router-dom')

describe('SupportPerformanceAgents', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the page title and section title', () => {
        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(AGENT_PERFORMANCE_SECTION_TITLE)
        ).toBeInTheDocument()
    })

    it('should render a banner that allows switching to the old version', () => {
        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(
            screen.getByText('Switch To Old Version', {exact: false})
        ).toBeInTheDocument()
        expect(screen.getByRole('link', {name: /Switch/})).toHaveAttribute(
            'href',
            AGENT_PERFORMANCE_LEGACY_PATH
        )
        expect(screen.getByRole('link', {name: 'Learn more.'})).toHaveAttribute(
            'href',
            LEARN_MORE_URL
        )
        expect(
            screen.getByText('Welcome to the new Agents Performance beta!', {
                exact: false,
            })
        ).toBeInTheDocument()
    })
})
