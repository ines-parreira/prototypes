import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleImpact } from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'

describe('KnowledgeEditorSidePanelSectionHelpCenterArticleImpact', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleImpact
                    successRate={0.28}
                    csat={3.2}
                    gmvInfluenced={{ value: 1200, currency: 'USD' }}
                    sectionId="impact"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('28%')).toBeInTheDocument()
        expect(screen.getByText('3.2')).toBeInTheDocument()
        expect(screen.getByText('$1,200')).toBeInTheDocument()
    })
})
