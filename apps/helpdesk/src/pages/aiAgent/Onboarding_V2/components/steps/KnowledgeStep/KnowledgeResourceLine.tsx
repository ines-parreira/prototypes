import { Box, Icon, Text } from '@gorgias/axiom'

import { KnowledgeSourceType } from '../types'

import css from './KnowledgeResourceLine.less'

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
            return 'vendor-shopify-colored'
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
                <Box className={css.badgeSynced} padding="xs">
                    <Icon name="check" size="sm" />
                    <Text variant="bold" size="sm">
                        Ready
                    </Text>
                </Box>
            ) : (
                <Box className={css.badgeSyncing} padding="xs" gap="xs">
                    <Icon
                        name="arrows-reload-alt-1"
                        data-testid="loading-spinner"
                        color="var(--content-neutral-tertiary)"
                    />
                    <Text variant="bold" size="sm">
                        Syncing
                    </Text>
                </Box>
            )}
        </Box>
    )
}
