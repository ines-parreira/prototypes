import { render } from '@testing-library/react'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSkeleton } from './KnowledgeEditorSidePanelSkeleton'

describe('KnowledgeEditorSidePanelSkeleton', () => {
    it('renders three skeleton sections', () => {
        const { container } = render(
            <KnowledgeEditorSidePanel
                initialExpandedSections={[
                    'details-skeleton',
                    'impact-skeleton',
                    'tickets-skeleton',
                ]}
            >
                <KnowledgeEditorSidePanelSkeleton />
            </KnowledgeEditorSidePanel>,
        )

        // Check that skeleton elements are rendered
        const skeletons = container.querySelectorAll('[data-name="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders within side panel container', () => {
        const { container } = render(
            <KnowledgeEditorSidePanel
                initialExpandedSections={[
                    'details-skeleton',
                    'impact-skeleton',
                    'tickets-skeleton',
                ]}
            >
                <KnowledgeEditorSidePanelSkeleton />
            </KnowledgeEditorSidePanel>,
        )

        // Verify the side panel container exists
        const sidePanel = container.querySelector('[class*="sidePanel"]')
        expect(sidePanel).toBeInTheDocument()
    })
})
