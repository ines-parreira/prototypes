import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleDetails', () => {
    it('renders published article when draft and published versions match', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                    article={{
                        id: 123,
                        title: 'Test Article',
                        draftVersionId: 100,
                        publishedVersionId: 100,
                    }}
                    createdDatetime={new Date('2025-06-17')}
                    lastUpdatedDatetime={new Date('2025-06-17')}
                    articleUrl="https://caitlynminimalist.com/products/duo-baguette-birthstone-ring"
                    sectionId="details"
                />
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

    it('renders draft when article has no published version', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                    article={{
                        id: 123,
                        title: 'Test Article',
                        draftVersionId: 100,
                        publishedVersionId: null,
                    }}
                    sectionId="details"
                />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders draft when draft version differs from published', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                    article={{
                        id: 123,
                        title: 'Test Article',
                        draftVersionId: 101,
                        publishedVersionId: 100,
                    }}
                    sectionId="details"
                />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders dash when article is undefined', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getAllByText('-')).toHaveLength(4) // Status, Created, Last updated, Article URL
    })
})
