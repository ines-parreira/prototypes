import { copilotAnchorProps } from 'copilot/uiActions'

import { KnowledgeEditorSidePanel } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanel'

import { useSkillEditorStore } from '../context'
import { SkillEditorSidePanelDetailsSection } from './SkillEditorSidePanelDetailsSection'
import { SkillEditorSidePanelIntentsSection } from './SkillEditorSidePanelIntentsSection'
import { SkillEditorSidePanelKnowledgeSection } from './SkillEditorSidePanelKnowledgeSection'

import css from './SkillEditorSidePanelInfoTab.less'

const INITIAL_EXPANDED_SECTIONS = ['details', 'intents', 'knowledge']

export const SkillEditorSidePanelInfoTab = () => {
    const skillId = useSkillEditorStore(
        (storeState) => storeState.state.skill?.id,
    )

    const skillAnchorTarget =
        skillId !== undefined
            ? ({ type: 'skill', id: skillId } as const)
            : undefined

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={INITIAL_EXPANDED_SECTIONS}
            className={css.sidePanel}
        >
            <SkillEditorSidePanelDetailsSection sectionId="details" />
            <SkillEditorSidePanelIntentsSection
                sectionId="intents"
                anchorProps={
                    skillAnchorTarget
                        ? copilotAnchorProps(skillAnchorTarget, 'intents')
                        : undefined
                }
            />
            <SkillEditorSidePanelKnowledgeSection
                sectionId="knowledge"
                anchorProps={
                    skillAnchorTarget
                        ? copilotAnchorProps(skillAnchorTarget, 'knowledge')
                        : undefined
                }
            />
        </KnowledgeEditorSidePanel>
    )
}
