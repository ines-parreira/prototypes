import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData } from '../../types'

import css from '../sidePanel/OrderSidePanelPreview.less'

export type DiscountCodeRowProps = {
    discountCode: NonNullable<OrderDetailsData['discount_codes']>[number]
    application:
        | NonNullable<OrderDetailsData['discount_applications']>[number]
        | undefined
    moneySymbol: string
}

export function DiscountCodeRow({
    discountCode,
    application,
    moneySymbol,
}: DiscountCodeRowProps) {
    const isPercentage =
        application?.value_type === 'percentage' && application.value
    const isShipping = discountCode.type === 'shipping'

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
                    Code
                </Text>
                <CopyableField
                    value={discountCode.code}
                    ariaLabel="Copy code"
                    inline
                >
                    <Text size="md">{discountCode.code}</Text>
                </CopyableField>
            </Box>
            {isPercentage ? (
                <>
                    <Box
                        display="grid"
                        w="100%"
                        alignItems="center"
                        gap="xs"
                        className={css.row}
                    >
                        <Text as="span" size="md" className={css.label}>
                            Discount
                        </Text>
                        <CopyableField
                            value={`${parseFloat(application.value!)}%`}
                            ariaLabel="Copy discount"
                            inline
                        >
                            <Text size="md">
                                {parseFloat(application.value!)}%
                            </Text>
                        </CopyableField>
                    </Box>
                    <Box
                        display="grid"
                        w="100%"
                        alignItems="center"
                        gap="xs"
                        className={css.row}
                    >
                        <Text as="span" size="md" className={css.label}>
                            Saved
                        </Text>
                        <CopyableField
                            value={`${moneySymbol}${discountCode.amount}`}
                            ariaLabel="Copy saved amount"
                            inline
                        >
                            <Text size="md">
                                {moneySymbol}
                                {discountCode.amount}
                            </Text>
                        </CopyableField>
                    </Box>
                </>
            ) : (
                <Box
                    display="grid"
                    w="100%"
                    alignItems="center"
                    gap="xs"
                    className={css.row}
                >
                    <Text as="span" size="md" className={css.label}>
                        Discount
                    </Text>
                    <CopyableField
                        value={
                            isShipping
                                ? 'Free shipping'
                                : `${moneySymbol}${discountCode.amount} off`
                        }
                        ariaLabel="Copy discount"
                        inline
                    >
                        <Text size="md">
                            {isShipping
                                ? 'Free shipping'
                                : `${moneySymbol}${discountCode.amount} off`}
                        </Text>
                    </CopyableField>
                </Box>
            )}
        </Box>
    )
}
