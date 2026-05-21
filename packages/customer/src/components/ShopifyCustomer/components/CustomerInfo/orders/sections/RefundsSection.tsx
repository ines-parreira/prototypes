import { useUserDateTimePreferences } from '@repo/preferences'
import { getMoneySymbol } from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { RefundRow } from './RefundRow'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    order: OrderDetailsData
}

export function RefundsSection({ order }: Props) {
    const { preferences } = useOrderFieldPreferences()
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    if (preferences.sections.refunds?.sectionVisible === false) return null
    if (!order.refunds?.length) return null

    const moneySymbol = order.currency
        ? getMoneySymbol(order.currency, true)
        : ''

    return (
        <Box className={css.section} p="sm" display="block" mt="sm">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Refunds
                </Text>
            </Box>
            <Box mb="sm" flexDirection="column" gap="xxxs">
                {order.refunds.map((refund) => (
                    <RefundRow
                        key={refund.id}
                        refund={refund}
                        moneySymbol={moneySymbol}
                        dateFormat={dateFormat}
                        timeFormat={timeFormat}
                        timezone={timezone}
                    />
                ))}
            </Box>
        </Box>
    )
}
