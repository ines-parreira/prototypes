import { KnowledgeEditorSidePanel } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'

import { SkillEditorSidePanelDetailsSection } from './SkillEditorSidePanelDetailsSection'
import { SkillEditorSidePanelIntentsSection } from './SkillEditorSidePanelIntentsSection'
import { SkillEditorSidePanelKnowledgeSection } from './SkillEditorSidePanelKnowledgeSection'

const INITIAL_EXPANDED_SECTIONS = ['details', 'intents', 'knowledge']

export const SkillEditorSidePanelInfoTab = () => {
    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={INITIAL_EXPANDED_SECTIONS}
        >
            <SkillEditorSidePanelDetailsSection sectionId="details" />
            <SkillEditorSidePanelIntentsSection sectionId="intents" />
            <SkillEditorSidePanelKnowledgeSection sectionId="knowledge" />
        </KnowledgeEditorSidePanel>
    )
}
