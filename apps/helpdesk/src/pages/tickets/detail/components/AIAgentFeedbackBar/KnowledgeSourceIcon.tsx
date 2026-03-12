import cs from 'classnames'

import { Icon } from '@gorgias/axiom'

import type { KnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { KNOWLEDGE_SOURCE_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon.less'

type KnowledgeSourceIconProps = {
    type: KnowledgeSourceType
    withLabel?: boolean
    badgeIconClassname?: string
}

const KnowledgeSourceIcon = ({
    type,
    withLabel = false,
    badgeIconClassname,
}: KnowledgeSourceIconProps) => {
    if (!KNOWLEDGE_SOURCE_TYPE[type]) {
        return null
    }

    return (
        <>
            <span className={cs(css.badge, badgeIconClassname)}>
                <Icon
                    name={KNOWLEDGE_SOURCE_TYPE[type].icon}
                    size={KNOWLEDGE_SOURCE_TYPE[type].size ?? 'xs'}
                />
            </span>
            {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
        </>
    )
}

export default KnowledgeSourceIcon
