import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from './KnowledgeEditorSidePanelSectionImpact'

describe('KnowledgeEditorSidePanelSectionImpact', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['impact']}>
                <KnowledgeEditorSidePanelSectionImpact
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
        expect(screen.getByText('$1.2K')).toBeInTheDocument()
    })
})
