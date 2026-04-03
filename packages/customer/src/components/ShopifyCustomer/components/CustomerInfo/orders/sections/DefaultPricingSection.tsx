import { Box, Text } from '@gorgias/axiom'

import { PriceRow } from './PriceRow'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    subtotalPrice?: string
    totalShippingPrice?: string
    totalDiscounts?: string
    totalTax?: string
    totalPrice?: string
    moneySymbol: string
}

export function DefaultPricingSection({
    subtotalPrice,
    totalShippingPrice,
    totalDiscounts,
    totalTax,
    totalPrice,
    moneySymbol,
}: Props) {
    return (
        <Box className={css.totals} flexDirection="column">
            <Box flexDirection="column" gap="xs" pt="md" pb="md">
                {subtotalPrice && (
                    <PriceRow
                        label="Subtotal"
                        amount={subtotalPrice}
                        moneySymbol={moneySymbol}
                    />
                )}
                {totalShippingPrice && (
                    <PriceRow
                        label="Shipping"
                        amount={totalShippingPrice}
                        moneySymbol={moneySymbol}
                    />
                )}
                {totalDiscounts && parseFloat(totalDiscounts) > 0 && (
                    <PriceRow
                        label="Discount"
                        amount={totalDiscounts}
                        moneySymbol={moneySymbol}
                        isNegative
                    />
                )}
                {totalTax && (
                    <PriceRow
                        label="Tax"
                        amount={totalTax}
                        moneySymbol={moneySymbol}
                    />
                )}
            </Box>
            {totalPrice && (
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    className={css.totalRow}
                >
                    <Text variant="bold">Total</Text>
                    <Text variant="bold">
                        {moneySymbol}
                        {totalPrice}
                    </Text>
                </Box>
            )}
        </Box>
    )
}
