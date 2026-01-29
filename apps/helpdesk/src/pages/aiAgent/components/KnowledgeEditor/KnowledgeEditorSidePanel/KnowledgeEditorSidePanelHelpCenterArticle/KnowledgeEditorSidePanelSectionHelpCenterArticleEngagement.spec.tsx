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

    it('renders default "Last 28 days" subtitle when no subtitle is provided', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement sectionId="engagement" />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Last 28 days')).toBeInTheDocument()
    })

    it('renders custom subtitle when provided', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    sectionId="engagement"
                    subtitle="Mar 1 – Mar 15, 2025"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Mar 1 – Mar 15, 2025')).toBeInTheDocument()
        expect(screen.queryByText('Last 28 days')).not.toBeInTheDocument()
    })

    it('renders dash for views when undefined', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    sectionId="engagement"
                    rating={0.5}
                    reactions={{ up: 10, down: 5 }}
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Views')).toBeInTheDocument()
        expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1)
    })

    it('renders dash for rating when undefined', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    sectionId="engagement"
                    views={100}
                    reactions={{ up: 10, down: 5 }}
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Rating')).toBeInTheDocument()
        expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1)
    })

    it('renders skeletons when loading', () => {
        render(
            <KnowledgeEditorSidePanel initialExpandedSections={['engagement']}>
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    sectionId="engagement"
                    views={100}
                    rating={0.5}
                    reactions={{ up: 10, down: 5 }}
                    isLoading
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.queryByText('100')).not.toBeInTheDocument()
        expect(screen.queryByText('50%')).not.toBeInTheDocument()
        expect(screen.queryByText('10 👍 | 5 👎')).not.toBeInTheDocument()
    })
})
