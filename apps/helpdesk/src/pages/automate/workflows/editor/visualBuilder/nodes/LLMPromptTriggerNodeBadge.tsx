import { Badge } from '@gorgias/axiom'

import css from './LLMPromptTriggerNodeBadge.less'

const LLMPromptTriggerNodeBadge = () => {
    return (
        <div className={css.container}>
            <Badge type={'light'} className={css.badge}>
                start
            </Badge>
        </div>
    )
}

export default LLMPromptTriggerNodeBadge
