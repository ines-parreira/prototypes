import React from 'react'

import { render, screen } from '@testing-library/react'

import StatsPage, {
    StatsPageBackgroundColor,
} from 'domains/reporting/pages/common/layout/StatsPage'

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
describe('StatsPage', () => {
    const pageContent = 'Children'

    it('should render the title, children and filters', () => {
        const title = 'Foo'
        const titleExtra = 'Filters'
        render(
            <StatsPage
                title={title}
                description="Foo statistic page"
                helpUrl="http://example.com"
                titleExtra={<p>{titleExtra}</p>}
            >
                {pageContent}
            </StatsPage>,
        )

        expect(screen.getByText(pageContent)).toBeInTheDocument()
        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(titleExtra)).toBeInTheDocument()
    })

    it('should render custom candu header id', () => {
        render(
            <StatsPage
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
                titleExtra={<p>Filters</p>}
                headerCanduId="foo-id"
            >
                {pageContent}
            </StatsPage>,
        )

        expect(
            document.querySelector(`div[data-candu-id="foo-id"]`),
        ).toBeInTheDocument()
    })

    it('should render custom candu header id', () => {
        render(
            <StatsPage
                title="Foo"
                description="Foo statistic page"
                titleExtra={<p>Filters</p>}
                backgroundColor={StatsPageBackgroundColor.Grey}
            >
                {pageContent}
            </StatsPage>,
        )

        const contentContainer = screen.getByText(pageContent)

        expect(contentContainer).toHaveClass(StatsPageBackgroundColor.Grey)
    })
})
