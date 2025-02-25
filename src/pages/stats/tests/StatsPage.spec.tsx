import React from 'react'

import { render } from '@testing-library/react'

import StatsPage from '../StatsPage'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
describe('StatsPage', () => {
    it('should render the title, children and filters', () => {
        const { container } = render(
            <StatsPage
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
                titleExtra={<p>Filters</p>}
            >
                Children
            </StatsPage>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render custom candu header id', () => {
        const { container } = render(
            <StatsPage
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
                titleExtra={<p>Filters</p>}
                headerCanduId="foo-id"
            >
                Children
            </StatsPage>,
        )
        expect(
            container.querySelector(`div[data-candu-id="foo-id"]`),
        ).toBeInTheDocument()
    })
})
