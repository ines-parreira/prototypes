import { isMacOs } from '@repo/utils'

import { Box, ShortcutKey, Text } from '@gorgias/axiom'

export function SearchSpotlightFooter() {
    return (
        <Box justifyContent="flex-end">
            <Box alignItems="center" flexWrap="wrap" gap="xl">
                <Box alignItems="center" gap="xxxs">
                    <Text size="sm" color="content-neutral-secondary">
                        Select
                    </Text>
                    <ShortcutKey>↑</ShortcutKey>
                    <Text size="sm" color="content-neutral-secondary">
                        /
                    </Text>
                    <ShortcutKey>↓</ShortcutKey>
                </Box>
                <Box alignItems="center" gap="xxxs">
                    <Text size="sm" color="content-neutral-secondary">
                        Open
                    </Text>
                    <ShortcutKey>↩</ShortcutKey>
                </Box>
                <Box alignItems="center" gap="xxxs">
                    <Text size="sm" color="content-neutral-secondary">
                        Open in a new tab
                    </Text>
                    <ShortcutKey>{isMacOs ? '⌘' : 'ctrl'}</ShortcutKey>
                    <Text size="sm" color="content-neutral-secondary">
                        +
                    </Text>
                    <ShortcutKey>↩</ShortcutKey>
                </Box>
            </Box>
        </Box>
    )
}
