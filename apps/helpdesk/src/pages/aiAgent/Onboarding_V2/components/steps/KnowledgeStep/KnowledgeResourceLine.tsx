import { Box, Icon, Tag, Text } from '@gorgias/axiom'

import { KnowledgeSourceType } from '../types'

type Props = {
    name: string
    type: KnowledgeSourceType
    isReady: boolean
}

const getIconName = (type: KnowledgeSourceType) => {
    switch (type) {
        case KnowledgeSourceType.DOMAIN:
            return 'nav-globe'
        case KnowledgeSourceType.SHOPIFY:
            return 'app-shopify'
        case KnowledgeSourceType.HELP_CENTER:
            return 'comm-chat-circle'
        default:
            return 'nav-globe'
    }
}

export const KnowledgeResourceLine: React.FC<Props> = ({
    name,
    type,
    isReady,
}) => {
    return (
        <Box display="flex" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap="xs">
                <Icon
                    name={getIconName(type)}
                    size="md"
                    color="var(--content-neutral-tertiary)"
                />
                <Text variant="bold">{name}</Text>
            </Box>
            {isReady ? (
                <Tag
                    color="green"
                    leadingSlot={<Icon name="check" size="sm" />}
                >
                    Ready
                </Tag>
            ) : (
                <Tag
                    color="grey"
                    leadingSlot={<Icon name="arrows-reload-alt-1" size="sm" />}
                >
                    Syncing
                </Tag>
            )}
        </Box>
    )
}
