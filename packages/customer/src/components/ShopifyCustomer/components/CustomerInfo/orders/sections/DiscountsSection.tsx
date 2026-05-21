import { getMoneySymbol } from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { DiscountCodeRow } from './DiscountCodeRow'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    order: OrderDetailsData
}

export function DiscountsSection({ order }: Props) {
    const { preferences } = useOrderFieldPreferences()

    if (preferences.sections.discounts?.sectionVisible === false) return null

    const { discount_codes, discount_applications, total_discounts } = order
    const hasCodes = discount_codes && discount_codes.length > 0
    const hasTotalDiscount = total_discounts && parseFloat(total_discounts) > 0

    if (!hasCodes && !hasTotalDiscount) return null

    const moneySymbol = order.currency
        ? getMoneySymbol(order.currency, true)
        : ''

    return (
        <Box className={css.section} p="sm" display="block" mt="sm">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Discounts
                </Text>
            </Box>
            <Box mb="sm" flexDirection="column" gap="xxxs">
                {discount_codes?.map((discountCode) => (
                    <DiscountCodeRow
                        key={discountCode.code}
                        discountCode={discountCode}
                        application={discount_applications?.find(
                            (a) => a.code === discountCode.code,
                        )}
                        moneySymbol={moneySymbol}
                    />
                ))}
            </Box>
        </Box>
    )
}
