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
                    reactions={{ positive: 871, negative: 635 }}
                    sectionId="engagement"
                    reportUrl="https://gorgias.gorgias.com/app/views"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Engagement')).toBeInTheDocument()
        expect(screen.getByText('1,208')).toBeInTheDocument()
        expect(screen.getByText('58%')).toBeInTheDocument()
        expect(screen.getByText('871 👍 | 635 👎')).toBeInTheDocument()
        expect(screen.getByText('View report')).toHaveAttribute(
            'href',
            'https://gorgias.gorgias.com/app/views',
        )
    })

    it('renders no reactions', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement sectionId="engagement" />
            </KnowledgeEditorSidePanel>,
        )
        expect(screen.getByText('- 👍 | - 👎')).toBeInTheDocument()
        expect(screen.getByText('View report')).not.toHaveAttribute('href')
    })
})
