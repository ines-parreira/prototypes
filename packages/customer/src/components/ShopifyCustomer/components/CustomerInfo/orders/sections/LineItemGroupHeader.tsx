import { Box, Tag, Text } from '@gorgias/axiom'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    title: string
    count: number
}

export function LineItemGroupHeader({ title, count }: Props) {
    return (
        <Box pb="md" flexDirection="row" alignItems="center" gap="xs">
            <Text size="md" variant="bold">
                {title}
            </Text>
            <Tag color="grey" className={css.lineItemsCount}>
                {count}
            </Tag>
        </Box>
    )
}
