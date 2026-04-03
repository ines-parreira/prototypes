import { Box, Text } from '@gorgias/axiom'

import type { OrderRefund } from '../../../../types'
import { getRefundNote } from './orderRefundUtils'
import { PriceRow } from './PriceRow'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    subtotalPrice?: string
    totalShippingPrice?: string
    totalDiscounts?: string
    totalTax?: string
    totalPrice?: string
    currentTotalPrice?: string
    moneySymbol: string
    refunds: OrderRefund[]
}

export function RefundPricingSection({
    subtotalPrice,
    totalShippingPrice,
    totalDiscounts,
    totalTax,
    totalPrice,
    currentTotalPrice,
    moneySymbol,
    refunds,
}: Props) {
    const paid = parseFloat(totalPrice ?? '0') || 0
    const netPayment = parseFloat(currentTotalPrice ?? '0') || 0
    const totalRefunded = Math.round((paid - netPayment) * 100) / 100
    const refundNote = getRefundNote(refunds)

    return (
        <Box className={css.totals} flexDirection="column">
            <Box flexDirection="column" gap="xs" pt="md" pb="md">
                {subtotalPrice && (
                    <PriceRow
                        label="Original order"
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
            <Box
                className={css.paymentDivider}
                flexDirection="column"
                gap="xs"
                pb="md"
            >
                <PriceRow
                    label="Paid"
                    amount={totalPrice}
                    moneySymbol={moneySymbol}
                />
                {totalRefunded > 0 && (
                    <PriceRow
                        label="Refunded"
                        amount={totalRefunded.toFixed(2)}
                        moneySymbol={moneySymbol}
                        isNegative
                        note={
                            refundNote ? `\u201C${refundNote}\u201D` : undefined
                        }
                    />
                )}
            </Box>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                className={css.totalRow}
            >
                <Text variant="bold">Net payment</Text>
                <Text variant="bold">
                    {netPayment < 0 ? '-' : ''}
                    {moneySymbol}
                    {Math.abs(netPayment).toFixed(2)}
                </Text>
            </Box>
        </Box>
    )
}
