import Caption from 'gorgias-design-system/Input/Caption'
import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import InputField from 'pages/common/forms/input/InputField'

import type { GuidanceVariableGroup } from '../../../GuidanceEditor/variables.types'

import css from './KnowledgeEditorGuidanceEditView.less'

type Props = {
    content: string
    onChangeContent: (content: string) => void
    title: string
    onChangeTitle: (title: string) => void
    shopName: string

    availableActions?: GuidanceAction[]
    availableVariables?: GuidanceVariableGroup[]
}

export const KnowledgeEditorGuidanceEditView = ({
    content,
    onChangeContent,
    title,
    onChangeTitle,
    shopName,
    availableActions,
    availableVariables,
}: Props) => (
    <div className={css.container}>
        <InputField
            label="Guidance name"
            isRequired
            caption={
                <>
                    Use a short, scenario-based name. Example:{' '}
                    <em>Returns outside the policy window</em>
                </>
            }
            onChange={onChangeTitle}
            name="name"
            value={title}
            maxLength={135}
            placeholder="Untitled"
        />
        <div className={css.editorContainer}>
            <GuidanceEditor
                content={content}
                handleUpdateContent={onChangeContent}
                label={GUIDANCE_EDITOR_DEFAULT_LABEL}
                shopName={shopName}
                availableActions={availableActions || []}
                showActionsButton={!!availableActions?.length}
                showVariablesButton={!!availableVariables?.length}
            />
            <Caption isValid>
                Provide instructions on how AI Agent should handle this
                situation.
            </Caption>
        </div>
    </div>
)
