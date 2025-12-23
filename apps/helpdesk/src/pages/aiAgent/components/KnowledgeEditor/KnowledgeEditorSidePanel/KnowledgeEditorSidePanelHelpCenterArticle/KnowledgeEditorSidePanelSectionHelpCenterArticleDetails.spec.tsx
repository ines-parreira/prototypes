import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useArticleDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks',
    () => ({
        useArticleDetailsFromContext: jest.fn(),
    }),
)

const mockUseArticleDetailsFromContext =
    useArticleDetailsFromContext as jest.Mock

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleDetails', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                    <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
                </KnowledgeEditorSidePanel>
            </MemoryRouter>,
        )
    }

    it('renders published article when isCurrent is true', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 100,
                publishedVersionId: 100,
                isCurrent: true,
            },
            createdDatetime: new Date('2025-06-17'),
            lastUpdatedDatetime: new Date('2025-06-17'),
            articleUrl:
                'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(
            screen.getByText(
                'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
            ),
        ).toBeInTheDocument()
    })

    it('renders draft when isCurrent is false', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 100,
                publishedVersionId: null,
                isCurrent: false,
            },
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders draft when viewing draft version (isCurrent is false)', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: {
                id: 123,
                title: 'Test Article',
                draftVersionId: 101,
                publishedVersionId: 100,
                isCurrent: false,
            },
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: {
                label: 'My Help Center',
                id: 1,
            },
        })

        renderComponent()
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders dash when article is undefined', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: undefined,
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
            helpCenter: undefined,
        })

        renderComponent()
        expect(screen.getAllByText('-')).toHaveLength(5)
    })

    describe('Help Center link', () => {
        it('renders Help Center link with correct URL and label', () => {
            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: {
                    label: 'My Test Help Center',
                    id: 42,
                },
            })

            renderComponent()

            const helpCenterLink = screen.getByRole('link', {
                name: 'My Test Help Center',
            })
            expect(helpCenterLink).toBeInTheDocument()
            expect(helpCenterLink).toHaveAttribute(
                'href',
                '/app/settings/help-center/42/articles',
            )
        })

        it('renders dash when helpCenter is undefined', () => {
            mockUseArticleDetailsFromContext.mockReturnValue({
                article: {
                    id: 123,
                    title: 'Test Article',
                    draftVersionId: 100,
                    publishedVersionId: 100,
                    isCurrent: true,
                },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                helpCenter: undefined,
            })

            renderComponent()

            const helpCenterLabel = screen.getByText('Help Center')
            expect(helpCenterLabel).toBeInTheDocument()

            expect(
                screen.queryByRole('link', { name: /Help Center/i }),
            ).not.toBeInTheDocument()
        })
    })
})
