import { CopyableField } from '@repo/ecommerce/shopify/components'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'
import type { DateFormatType, TimeFormatType } from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

import type { OrderRefund } from '../../../../types'

import css from '../sidePanel/OrderSidePanelPreview.less'

export type RefundRowProps = {
    refund: OrderRefund
    moneySymbol: string
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    timezone: string | undefined
}

export function RefundRow({
    refund,
    moneySymbol,
    dateFormat,
    timeFormat,
    timezone,
}: RefundRowProps) {
    const total = refund.transactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
    )
    const date = formatOrderDate(
        refund.processed_at,
        dateFormat,
        timeFormat,
        timezone,
    )
    const totalStr = `${moneySymbol}${total.toFixed(2)}`

    return (
        <Box flexDirection="column" gap="xxxs">
            <Box
                display="grid"
                w="100%"
                alignItems="center"
                gap="xs"
                className={css.row}
            >
                <Text as="span" size="md" className={css.label}>
                    {date}
                </Text>
                <CopyableField
                    value={totalStr}
                    ariaLabel="Copy refund amount"
                    inline
                >
                    <Text size="md">{totalStr}</Text>
                </CopyableField>
            </Box>
            {refund.note && (
                <Box
                    display="grid"
                    w="100%"
                    alignItems="center"
                    gap="xs"
                    className={css.row}
                >
                    <Text as="span" size="md" className={css.label}>
                        Note
                    </Text>
                    <CopyableField
                        value={refund.note}
                        ariaLabel="Copy refund note"
                        inline
                    >
                        <Text size="md">{refund.note}</Text>
                    </CopyableField>
                </Box>
            )}
        </Box>
    )
}
