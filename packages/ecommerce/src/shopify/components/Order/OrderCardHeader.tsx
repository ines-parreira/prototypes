import { Box, CardHeader, Icon, Text } from '@gorgias/axiom'

import css from './OrderCard.less'

type OrderCardHeaderProps = {
    orderName: string
    displayedDate: string
}

export function OrderCardHeader({
    orderName,
    displayedDate,
}: OrderCardHeaderProps) {
    return (
        <CardHeader
            leadingSlot={
                <span className={css.iconWrapper}>
                    <Icon name="vendor-shopify-colored" size="md" />
                </span>
            }
            title={
                <Box
                    justifyContent="space-between"
                    alignItems="center"
                    flex="1"
                    minWidth={0}
                    gap="xxxs"
                >
                    <Box minWidth={0}>
                        <Text size="sm" variant="bold" overflow="ellipsis">
                            {orderName}
                        </Text>
                    </Box>

                    <Box flexShrink="0" className={css.noWrap}>
                        <Text
                            size="sm"
                            variant="regular"
                            className={css.dateText}
                        >
                            {displayedDate}
                        </Text>
                    </Box>
                </Box>
            }
        />
    )
}
