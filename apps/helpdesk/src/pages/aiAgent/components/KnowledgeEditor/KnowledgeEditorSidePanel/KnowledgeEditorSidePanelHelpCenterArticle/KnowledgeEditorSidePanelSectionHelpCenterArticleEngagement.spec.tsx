import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement } from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement'

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    views={1208}
                    rating={0.58}
                    reactions={{ up: 871, down: 635 }}
                    sectionId="engagement"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Engagement')).toBeInTheDocument()
        expect(screen.getByText('1,208')).toBeInTheDocument()
        expect(screen.getByText('58%')).toBeInTheDocument()
        expect(screen.getByText('871 👍 | 635 👎')).toBeInTheDocument()
    })

    it('renders no reactions', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement sectionId="engagement" />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('- 👍 | - 👎')).toBeInTheDocument()
    })
})
