import { Box, Text } from '@gorgias/axiom'

import { UserRole } from 'config/types/user'

import css from './KnowledgeEditorSidePanelBackendIds.less'

type Props = {
    ids: Record<string, string | number>
}

export const KnowledgeEditorSidePanelBackendIds = ({ ids }: Props) => {
    const currentUser = window.GORGIAS_STATE?.currentUser
    const isGorgiasAgent = currentUser?.role?.name === UserRole.GorgiasAgent

    if (!isGorgiasAgent || Object.keys(ids).length === 0) {
        return null
    }

    return (
        <Box
            className={css.container}
            flexDirection="column"
            gap="xxxs"
            padding="md"
        >
            <Text size="xs" className={css.explanatoryText}>
                Visible during impersonation only
            </Text>
            {Object.entries(ids).map(([label, value]) => (
                <Box
                    key={label}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Text size="xs" className={css.label}>
                        {label}:
                    </Text>
                    <Text size="xs" className={css.value}>
                        {value}
                    </Text>
                </Box>
            ))}
        </Box>
    )
}
