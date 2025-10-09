import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleDetails', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                    isPublished={true}
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

    it('renders draft', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                    isPublished={false}
                    sectionId="details"
                />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })
})
