import type { CSSProperties } from 'react'

import { Box, Skeleton } from '@gorgias/axiom'

const editorSkeletonStyle = {
    border: '1px solid var(--border-neutral-default)',
    borderRadius: 'var(--spacing-sm)',
    backgroundColor: 'var(--elevation-neutral-mid)',
    boxShadow: 'var(--effects-shadow-container)',
} satisfies CSSProperties

const editorSkeletonRowStyle = {
    borderBottom: '1px solid var(--border-neutral-default)',
} satisfies CSSProperties

export function TicketThreadEditorSkeleton() {
    return (
        <Box
            flexDirection="column"
            minHeight={370}
            overflow="hidden"
            role="status"
            aria-label="Loading reply editor"
            style={editorSkeletonStyle}
        >
            <Box
                alignItems="center"
                gap="md"
                h={40}
                px="sm"
                style={editorSkeletonRowStyle}
            >
                <Skeleton width={16} height={16} circle />
                <Skeleton width={210} height={16} />
            </Box>
            <Box
                alignItems="center"
                gap="lg"
                h={40}
                px="sm"
                style={editorSkeletonRowStyle}
            >
                <Skeleton width={16} height={16} />
                <Skeleton width="45%" height={16} />
                <Skeleton width={12} height={12} />
            </Box>
            <Box flex={1} px="sm" py="md">
                <Skeleton width="42%" height={16} />
            </Box>
            <Box flexDirection="column" gap="sm" p="sm">
                <Box flexDirection="column" gap="xs">
                    <Skeleton width={110} height={14} />
                    <Box alignItems="center" gap="xs" flexWrap="wrap">
                        <Skeleton width={80} height={26} borderRadius={13} />
                        <Skeleton width={150} height={26} borderRadius={13} />
                        <Skeleton width={130} height={26} borderRadius={13} />
                    </Box>
                </Box>
                <Box flexDirection="column" gap="xs">
                    <Box alignItems="center" gap="xs" flexWrap="wrap">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                width={16}
                                height={16}
                                borderRadius={4}
                            />
                        ))}
                    </Box>
                    <Box alignItems="center" gap="xs" flexWrap="wrap" pt="xs">
                        <Skeleton width={60} height={32} borderRadius={8} />
                        <Skeleton width={116} height={32} borderRadius={8} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
