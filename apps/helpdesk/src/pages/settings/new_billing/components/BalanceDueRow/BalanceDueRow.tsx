import type { ReactNode } from 'react'

import {
    Box,
    Button,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

type BalanceDueRowProps = {
    isLoading?: boolean
    errorMessage?: string
    onRetry?: () => void
    tooltip?: string
    children: ReactNode
}

export function BalanceDueRow({
    isLoading = false,
    errorMessage,
    onRetry,
    tooltip,
    children,
}: BalanceDueRowProps) {
    return (
        <Box justifyContent="space-between" alignItems="center" gap="sm">
            <Box alignItems="center">
                <Text variant="bold">Balance due today</Text>
                {tooltip && (
                    <Tooltip
                        delay={0}
                        trigger={
                            <Button
                                variant="tertiary"
                                size="sm"
                                icon="info"
                                aria-label="Unbilled charges disclaimer"
                                excludeFromTabOrder
                            />
                        }
                    >
                        <TooltipContent title={tooltip} />
                    </Tooltip>
                )}
            </Box>
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
