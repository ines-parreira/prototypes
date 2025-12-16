import { render, screen } from '@testing-library/react'

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
        })

        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            </KnowledgeEditorSidePanel>,
        )

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
        })

        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            </KnowledgeEditorSidePanel>,
        )
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
        })

        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders dash when article is undefined', () => {
        mockUseArticleDetailsFromContext.mockReturnValue({
            article: undefined,
            createdDatetime: undefined,
            lastUpdatedDatetime: undefined,
            articleUrl: undefined,
        })

        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getAllByText('-')).toHaveLength(4) // Status, Created, Last updated, Article URL
    })
})
