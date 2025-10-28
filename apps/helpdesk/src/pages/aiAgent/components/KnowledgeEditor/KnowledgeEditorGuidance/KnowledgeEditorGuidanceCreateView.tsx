import Caption from 'gorgias-design-system/Input/Caption'
import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import InputField from 'pages/common/forms/input/InputField'

import { GuidanceVariableGroup } from '../../GuidanceEditor/variables.types'

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

export const KnowledgeEditorGuidanceCreateView = ({
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
            caption="Provide a name for this Guidance. e.g. When a customer asks for a return or exchange"
            onChange={onChangeTitle}
            name="name"
            value={title}
            maxLength={135}
        />
        <div className={css.editorContainer}>
            <GuidanceEditor
                content={content}
                handleUpdateContent={onChangeContent}
                label={GUIDANCE_EDITOR_DEFAULT_LABEL}
                shopName={shopName}
                availableActions={availableActions || []}
                showActionsButton={availableActions !== undefined}
                showVariablesButton={availableVariables !== undefined}
            />
            <Caption isValid>
                Provide instructions on how AI Agent should handle this
                situation.
            </Caption>
        </div>
    </div>
)
