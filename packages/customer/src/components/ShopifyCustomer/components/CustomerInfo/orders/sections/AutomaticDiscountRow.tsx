import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData } from '../../types'

import css from '../sidePanel/OrderSidePanelPreview.less'

type AutomaticApplication = NonNullable<
    OrderDetailsData['discount_applications']
>[number] & { title: string }

export type AutomaticDiscountRowProps = {
    application: AutomaticApplication
    moneySymbol: string
}

export function AutomaticDiscountRow({
    application,
    moneySymbol,
}: AutomaticDiscountRowProps) {
    const isPercentage =
        application.value_type === 'percentage' && application.value

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
                    Title
                </Text>
                <CopyableField
                    value={application.title}
                    ariaLabel="Copy discount title"
                    inline
                >
                    <Text size="md">{application.title}</Text>
                </CopyableField>
            </Box>
            {application.value && (
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
                            isPercentage
                                ? `${parseFloat(application.value)}%`
                                : `${moneySymbol}${application.value} off`
                        }
                        ariaLabel="Copy discount"
                        inline
                    >
                        <Text size="md">
                            {isPercentage
                                ? `${parseFloat(application.value)}%`
                                : `${moneySymbol}${application.value} off`}
                        </Text>
                    </CopyableField>
                </Box>
            )}
        </Box>
    )
}
