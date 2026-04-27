import type { ReactNode } from 'react'

import { Box, Button, Skeleton, Text } from '@gorgias/axiom'

type BalanceDueRowProps = {
    isLoading?: boolean
    errorMessage?: string
    onRetry?: () => void
    children: ReactNode
}

export function BalanceDueRow({
    isLoading = false,
    errorMessage,
    onRetry,
    children,
}: BalanceDueRowProps) {
    return (
        <Box justifyContent="space-between" alignItems="center" gap="sm">
            <Text variant="bold">Balance due today</Text>
            <BalanceDueValue
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRetry={onRetry}
            >
                {children}
            </BalanceDueValue>
        </Box>
    )
}

type BalanceDueValueProps = {
    isLoading: boolean
    errorMessage?: string
    onRetry?: () => void
    children: ReactNode
}

function BalanceDueValue({
    isLoading,
    errorMessage,
    onRetry,
    children,
}: BalanceDueValueProps) {
    if (isLoading) {
        return <Skeleton width={120} height={20} />
    }

    if (errorMessage) {
        return (
            <Box alignItems="center" gap="xs">
                <Text color="content-error-default" size="sm">
                    {errorMessage}
                </Text>
                {onRetry && (
                    <Button size="sm" onClick={onRetry}>
                        Retry
                    </Button>
                )}
            </Box>
        )
    }

    return <Text variant="bold">{children}</Text>
}
