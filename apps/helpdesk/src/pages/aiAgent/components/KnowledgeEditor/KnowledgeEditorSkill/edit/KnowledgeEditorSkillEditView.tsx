import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import css from './KnowledgeEditorSkillEditView.less'

type Props = {
    content: string
    onChangeContent: (content: string) => void
    shopName: string

    availableActions?: GuidanceAction[]
    availableVariables?: GuidanceVariableGroup[]
}

export const KnowledgeEditorSkillEditView = ({
    content,
    onChangeContent,
    shopName,
    availableActions,
    availableVariables,
}: Props) => (
    <div className={css.container}>
        <GuidanceEditor
            content={content}
            handleUpdateContent={onChangeContent}
            label={GUIDANCE_EDITOR_DEFAULT_LABEL}
            shopName={shopName}
            availableActions={availableActions || []}
            showActionsButton={true}
            showVariablesButton={!!availableVariables?.length}
            editorContextName="Skill"
            description="Write step-by-step instructions for how AI Agent should handle conversations tied to this skill's intents."
        />
    </div>
)
