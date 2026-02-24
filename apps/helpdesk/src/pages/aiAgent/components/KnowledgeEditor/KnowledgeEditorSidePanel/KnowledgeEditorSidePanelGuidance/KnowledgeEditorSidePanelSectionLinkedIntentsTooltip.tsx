import { Box, Text } from '@gorgias/axiom'

import css from './KnowledgeEditorSidePanelSectionLinkedIntents.less'

export const KnowledgeEditorSidePanelSectionLinkedIntentsTooltip = () => {
    return (
        <Box flexDirection="column" gap="xs">
            <Text size="sm">
                When one or more intents are linked to a guidance, AI Agent will
                prioritize this guidance to respond to these intents.
            </Text>
            <Box flexDirection="column" gap="xxxxs">
                <Text size="sm" variant="bold">
                    If a guidance has no linked intents:
                </Text>
                <ul className={css.tooltipList}>
                    <li>Customer asks a question</li>
                    <li>AI Agent searches across all knowledge</li>
                    <li>It may use different guidance each time</li>
                </ul>
            </Box>
            <Box flexDirection="column" gap="xxxxs">
                <Text size="sm" variant="bold">
                    If a guidance has linked intents:
                </Text>
                <ul className={css.tooltipList}>
                    <li>Customer asks a question</li>
                    <li>
                        AI Agent prioritizes this guidance when the linked
                        intent is detected
                    </li>
                    <li>Responses stay consistent every time</li>
                </ul>
            </Box>
        </Box>
    )
}
