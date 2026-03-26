import type { MouseEvent } from 'react'

import {
    Box,
    Card,
    Elevation,
    Heading,
    Icon,
    Skeleton,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import type { PolicyKey } from 'models/selfServiceConfiguration/types'

import type { OrderManagementFlow } from './useOrderManagementFlows'

import css from './OrderManagementFlowsCard.less'

type Props = {
    isLoading: boolean
    isUpdatePending: boolean
    flows: OrderManagementFlow[]
    onFlowToggle: (flow: PolicyKey, isEnabled: boolean) => void
    onFlowClick: (routePath: string) => void
}

export const OrderManagementFlowsCard = ({
    isLoading,
    isUpdatePending,
    flows,
    onFlowToggle,
    onFlowClick,
}: Props) => {
    if (isLoading) {
        return <Skeleton height={280} />
    }

    return (
        <Card elevation={Elevation.Mid} py="md" px="lg" gap="lg">
            <Box flexDirection="column" gap="xxxs">
                <Heading size="md">Order management</Heading>
                <Text size="md" color="content-neutral-secondary">
                    Let customers sign in to track, return, cancel or report
                    issues with orders.
                </Text>
            </Box>
            <div className={css.table}>
                <div className={css.tableHeader}>
                    <Text size="sm" color="content-neutral-secondary">
                        Show
                    </Text>
                    <Text size="sm" color="content-neutral-secondary">
                        Button
                    </Text>
                </div>
                {flows.map((flow) => (
                    <div
                        key={flow.key}
                        className={css.tableRow}
                        onClick={() =>
                            flow.canNavigate && onFlowClick(flow.routePath)
                        }
                        role={flow.canNavigate ? 'button' : undefined}
                    >
                        <div
                            className={css.toggleWrapper}
                            onClick={(e: MouseEvent) => e.stopPropagation()}
                        >
                            <ToggleField
                                value={flow.isEnabled}
                                isDisabled={isUpdatePending}
                                onChange={(value) =>
                                    onFlowToggle(flow.key, value)
                                }
                            />
                        </div>
                        <Text size="md">{flow.title}</Text>
                        {flow.canNavigate && (
                            <Icon name="arrow-chevron-right" size="sm" />
                        )}
                    </div>
                ))}
            </div>
        </Card>
    )
}
