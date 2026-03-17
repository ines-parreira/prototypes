import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    Card,
    Elevation,
    Heading,
    Skeleton,
    Tag,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import css from './OrderManagementCard.less'

type OrderManagementCardProps = {
    isEnabled: boolean
    isDisabled?: boolean
    isLoading?: boolean
    showStoreRequired?: boolean
    orderManagementUrl: string
    onChange: (value: boolean) => void
}

export function OrderManagementCard({
    isEnabled,
    isDisabled = false,
    isLoading = false,
    showStoreRequired = false,
    orderManagementUrl,
    onChange,
}: OrderManagementCardProps) {
    if (isLoading) {
        return <Skeleton height={140} />
    }

    return (
        <Card elevation={Elevation.Mid} p="md" className={css.card} gap="md">
            <Box flexDirection="column" gap="xs">
                <Box justifyContent="space-between" alignItems="center">
                    <Heading size="md">Order Management</Heading>
                    <Box alignItems="center" gap="xs">
                        {showStoreRequired && (
                            <Tag color="blue" size="md">
                                Store required
                            </Tag>
                        )}
                        <ToggleField
                            value={isEnabled}
                            onChange={onChange}
                            isDisabled={isDisabled}
                        />
                    </Box>
                </Box>
                <Text
                    size="md"
                    className={css.description}
                    color="content-neutral-secondary"
                >
                    Allow customers to track and manage their orders directly
                    within your Chat.
                </Text>
            </Box>
            <div>
                <Link to={orderManagementUrl}>
                    <Button variant="secondary" size="md">
                        Edit Order Management
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
