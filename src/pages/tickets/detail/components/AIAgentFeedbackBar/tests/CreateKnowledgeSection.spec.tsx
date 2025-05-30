import { fireEvent, render, screen } from '@testing-library/react'

import CreateKnowledgeSection from '../CreateKnowledgeSection'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            guidanceTemplates: '/mock/guidance-templates',
        },
    }),
}))

describe('CreateKnowledgeSection', () => {
    const shopName = 'MyShop'
    const helpCenterId = 123

    it('should render the component and toggles dropdown', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        expect(
            screen.getByText(
                /Create new knowledge to be used in similar requests/i,
            ),
        ).toBeInTheDocument()

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        expect(screen.getByText('Create Guidance')).toBeInTheDocument()
        expect(
            screen.getByText('Create Help Center article'),
        ).toBeInTheDocument()
    })

    it('should contain correct links in dropdown items', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance').closest('a')
        const articleLink = screen
            .getByText('Create Help Center article')
            .closest('a')

        expect(guidanceLink).toHaveAttribute('href', '/mock/guidance-templates')
        expect(guidanceLink).toHaveAttribute('target', '_blank')
        expect(articleLink).toHaveAttribute(
            'href',
            '/app/settings/help-center/123/articles',
        )
        expect(articleLink).toHaveAttribute('rel', 'noreferrer')
    })

    it('should open dropdown and closes it after clicking guidance link', () => {
        render(
            <CreateKnowledgeSection
                shopName={shopName}
                helpCenterId={helpCenterId}
            />,
        )

        const button = screen.getByRole('button', { name: /Create knowledge/i })
        fireEvent.click(button)

        const guidanceLink = screen.getByText('Create Guidance')
        expect(guidanceLink).toBeInTheDocument()

        fireEvent.click(guidanceLink)

        expect(screen.queryByText('Create Guidance')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Create Help Center article'),
        ).not.toBeInTheDocument()
    })
})
