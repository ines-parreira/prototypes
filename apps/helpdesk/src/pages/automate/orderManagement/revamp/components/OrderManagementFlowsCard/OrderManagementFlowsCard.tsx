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
import EmptyResponseMessageContentError from 'pages/automate/common/components/EmptyResponseMessageContentError'

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
                {flows.map((flow) => {
                    const rowContent = (
                        <>
                            <Text size="md">{flow.title}</Text>
                            <div className={css.alert}>
                                {flow.hasEmptyResponse && (
                                    <EmptyResponseMessageContentError />
                                )}
                            </div>
                            {flow.canNavigate && (
                                <Icon name="arrow-chevron-right" size="sm" />
                            )}
                        </>
                    )

                    if (!flow.canNavigate) {
                        return (
                            <div key={flow.key} className={css.tableRow}>
                                <div className={css.toggleWrapper}>
                                    <ToggleField
                                        value={flow.isEnabled}
                                        isDisabled={isUpdatePending}
                                        onChange={(value) =>
                                            onFlowToggle(flow.key, value)
                                        }
                                    />
                                </div>
                                <div className={css.flowContent}>
                                    {rowContent}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={flow.key} className={css.tableRow}>
                            <div className={css.toggleWrapper}>
                                <ToggleField
                                    value={flow.isEnabled}
                                    isDisabled={isUpdatePending}
                                    onChange={(value) =>
                                        onFlowToggle(flow.key, value)
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                className={css.flowButton}
                                onClick={() => onFlowClick(flow.routePath)}
                            >
                                {rowContent}
                            </button>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
