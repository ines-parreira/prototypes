import type { IconSize } from '@gorgias/axiom'
import { Box, Icon, Tag, TagColor } from '@gorgias/axiom'

import type { KnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { KNOWLEDGE_SOURCE_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'

type KnowledgeSourceIconProps = {
    type: KnowledgeSourceType
    iconSize?: IconSize
    withLabel?: boolean
    badgeIconClassname?: string
}

const KnowledgeSourceIcon = ({
    type,
    iconSize,
    withLabel = false,
    badgeIconClassname,
}: KnowledgeSourceIconProps) => {
    if (!KNOWLEDGE_SOURCE_TYPE[type]) {
        return null
    }

    return (
        <Box gap="xxxs" alignItems="center">
            <Tag color={TagColor.Grey} size="sm" className={badgeIconClassname}>
                <Icon
                    name={KNOWLEDGE_SOURCE_TYPE[type].icon}
                    size={KNOWLEDGE_SOURCE_TYPE[type].size ?? iconSize ?? 'sm'}
                />
            </Tag>
            {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
        </Box>
    )
}

export default KnowledgeSourceIcon
