import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'

import css from './LLMPromptTriggerNodeLabel.less'

type Props = {
    isFilled: boolean
}

const LLMPromptTriggerNodeLabel = ({ isFilled }: Props) => {
    return (
        <div className={css.container}>
            <VisualBuilderActionTag nodeType="llm_prompt_trigger" />
            {!isFilled && <span className={css.suffix}>(optional)</span>}
        </div>
    )
}

export default LLMPromptTriggerNodeLabel
