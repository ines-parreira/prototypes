import { Box, Button, Tag, Text } from '@gorgias/axiom'

import css from './OrdersSectionHeader.less'

type Props = {
    count: number
    onCreateOrder?: () => void
}

export function OrdersSectionHeader({ count, onCreateOrder }: Props) {
    return (
        <div className={css.header}>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
            >
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Text size="md" variant="bold">
                        Orders
                    </Text>
                    {/* Stringify the count so axiom Tag applies its
                     * text-padded variant rather than the slim icon-only
                     * padding it uses for numeric/icon children. */}
                    <Tag color="grey">{`${count}`}</Tag>
                </Box>

                {onCreateOrder && (
                    <Button
                        as="button"
                        variant="secondary"
                        size="sm"
                        leadingSlot="add-plus"
                        onClick={onCreateOrder}
                    >
                        Create order
                    </Button>
                )}
            </Box>
        </div>
    )
}
