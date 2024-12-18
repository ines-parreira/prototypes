import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './LLMPromptTriggerNodeBadge.less'

const LLMPromptTriggerNodeBadge = () => {
    return (
        <div className={css.container}>
            <Badge type={ColorType.Light} className={css.badge}>
                start
            </Badge>
        </div>
    )
}

export default LLMPromptTriggerNodeBadge
