import { render, screen } from '@testing-library/react'

import type { GroupedKnowledgeItem } from '../types'
import { KnowledgeType, KnowledgeVisibility } from '../types'
import {
    EmptyStateDocument,
    EmptyStateDomain,
    EmptyStateFAQ,
    EmptyStateGuidance,
    EmptyStates,
    EmptyStateURL,
    EmptyStateWrapper,
} from './EmptyStates'

describe('EmptyStates', () => {
    describe('EmptyStates (main component)', () => {
        it('renders create new content section', () => {
            render(<EmptyStates />)

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })

        it('renders sync or upload external content section', () => {
            render(<EmptyStates />)

            expect(
                screen.getByRole('heading', {
                    name: 'Sync or upload external content',
                }),
            ).toBeInTheDocument()
        })

        it('displays Guidance card in create section', () => {
            render(<EmptyStates />)

            expect(screen.getByText('Guidance')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow internal processes.',
                ),
            ).toBeInTheDocument()
        })

        it('displays FAQ card in create section', () => {
            render(<EmptyStates />)

            expect(screen.getByText('Help Center articles')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Let AI Agent use published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('displays Website card when hasWebsiteSync is false', () => {
            render(<EmptyStates hasWebsiteSync={false} />)

            expect(screen.getByText('Store website')).toBeInTheDocument()
            expect(
                screen.getByText('Sync your site content'),
            ).toBeInTheDocument()
        })

        it('does not display Website card when hasWebsiteSync is true', () => {
            render(<EmptyStates hasWebsiteSync={true} />)

            expect(screen.queryByText('Store website')).not.toBeInTheDocument()
        })

        it('displays URL card', () => {
            render(<EmptyStates />)

            expect(screen.getByText('URLs')).toBeInTheDocument()
            expect(
                screen.getByText('Sync single-page URLs'),
            ).toBeInTheDocument()
        })

        it('displays Documents card', () => {
            render(<EmptyStates />)

            expect(screen.getByText('Documents')).toBeInTheDocument()
            expect(
                screen.getByText('Upload external files'),
            ).toBeInTheDocument()
        })

        it('applies center alignment by default', () => {
            const { container } = render(<EmptyStates />)

            const headings = container.querySelectorAll('h4')
            expect(headings.length).toBeGreaterThan(0)
        })

        it('applies custom alignment when provided', () => {
            const { container } = render(
                <EmptyStates titleAlignment="flex-start" />,
            )

            const headings = container.querySelectorAll('h4')
            expect(headings.length).toBeGreaterThan(0)
        })
    })

    describe('EmptyStateGuidance', () => {
        it('renders guidance empty state', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
        })

        it('displays guidance description', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow end-to-end processes with internal-facing Guidance.',
                ),
            ).toBeInTheDocument()
        })

        it('displays create guidance button', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByRole('button', { name: 'Create Guidance' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateFAQ', () => {
        const mockArticles = [
            {
                type: KnowledgeType.FAQ,
                title: 'Test Article',
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
        ]

        it('renders connect help center state when helpCenterId is null', () => {
            render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Connect Help Center' }),
            ).toBeInTheDocument()
        })

        it('renders get started state when helpCenterId exists', () => {
            render(<EmptyStateFAQ helpCenterId={123} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: 'Create Help Center article',
                }),
            ).toBeInTheDocument()
        })

        it('displays correct description when no articles exist', () => {
            render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

            expect(
                screen.getByText(
                    'Let AI Agent use your published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('displays different description when articles exist', () => {
            render(<EmptyStateFAQ helpCenterId={123} articles={mockArticles} />)

            expect(
                screen.getByText(
                    'Create and publish articles to make them available to AI Agent.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDomain', () => {
        it('renders domain empty state', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByRole('heading', {
                    name: 'Sync your store website',
                }),
            ).toBeInTheDocument()
        })

        it('displays domain description', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByText(
                    /Use your website.s content and product pages as knowledge for AI Agent/,
                ),
            ).toBeInTheDocument()
        })

        it('displays sync button', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByRole('button', { name: /Sync/ }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateURL', () => {
        it('renders URL empty state', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByRole('heading', { name: 'Add URLs' }),
            ).toBeInTheDocument()
        })

        it('displays URL description', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByText(
                    'Add links to public pages AI Agent can learn from like blog posts or external documentation.',
                ),
            ).toBeInTheDocument()
        })

        it('displays add URL button', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByRole('button', { name: 'Add URL' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDocument', () => {
        it('renders document empty state', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
        })

        it('displays document description', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByText(
                    'Upload external documents such as policies or product manuals to help your AI Agent provide more accurate answers.',
                ),
            ).toBeInTheDocument()
        })

        it('displays upload document button', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByRole('button', { name: 'Upload Document' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateWrapper', () => {
        const mockArticles = [] as unknown as GroupedKnowledgeItem[]

        it('renders EmptyStates when no filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={null}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateDocument when Document filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Document}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateDomain when Domain filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Domain}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Sync your store website',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateFAQ when FAQ filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateGuidance when Guidance filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Guidance}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateURL when URL filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.URL}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Add URLs' }),
            ).toBeInTheDocument()
        })

        it('passes helpCenterId to EmptyStateFAQ', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={123}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
        })

        it('passes articles to EmptyStateFAQ', () => {
            const articles = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            ]

            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={123}
                    articles={articles}
                />,
            )

            expect(
                screen.getByText(
                    'Create and publish articles to make them available to AI Agent.',
                ),
            ).toBeInTheDocument()
        })
    })
})
