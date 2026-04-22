import { KnowledgeEditorSidePanel } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'
import { SkillEditorSidePanelPerformanceSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelPerformanceSection'

import { SkillEditorSidePanelDetailsSection } from './SkillEditorSidePanelDetailsSection'
import { SkillEditorSidePanelIntentsSection } from './SkillEditorSidePanelIntentsSection'
import { SkillEditorSidePanelKnowledgeSection } from './SkillEditorSidePanelKnowledgeSection'
import { SkillEditorSidePanelRecentTicketsSection } from './SkillEditorSidePanelRecentTicketsSection'

import css from './SkillPreviewSidePanel.less'

const INITIAL_EXPANDED_SECTIONS = [
    'details',
    'intents',
    'knowledge',
    'performance',
    'recent-tickets',
]

export const SkillPreviewSidePanel = () => {
    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={INITIAL_EXPANDED_SECTIONS}
            className={css.previewPanel}
        >
            <SkillEditorSidePanelDetailsSection sectionId="details" />
            <SkillEditorSidePanelIntentsSection sectionId="intents" />
            <SkillEditorSidePanelKnowledgeSection sectionId="knowledge" />
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />
            <SkillEditorSidePanelRecentTicketsSection sectionId="recent-tickets" />
        </KnowledgeEditorSidePanel>
    )
}
