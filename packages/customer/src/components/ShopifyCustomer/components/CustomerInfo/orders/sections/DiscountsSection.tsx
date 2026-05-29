import { getMoneySymbol } from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { AutomaticDiscountRow } from './AutomaticDiscountRow'
import { DiscountCodeRow } from './DiscountCodeRow'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    order: OrderDetailsData
}

export function DiscountsSection({ order }: Props) {
    const { preferences } = useOrderFieldPreferences()

    if (preferences.sections.discounts?.sectionVisible === false) return null

    const { discount_codes, discount_applications } = order
    const hasCodes = discount_codes && discount_codes.length > 0
    const automaticApplications = (discount_applications ?? []).filter(
        (a): a is typeof a & { title: string } =>
            a.type === 'automatic' && Boolean(a.title),
    )

    if (!hasCodes && automaticApplications.length === 0) return null

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
            <Box flexDirection="column" gap="xxxs">
                {discount_codes?.map((discountCode, index) => (
                    <Box
                        key={discountCode.code}
                        className={index > 0 ? css.discountDivider : undefined}
                    >
                        <DiscountCodeRow
                            discountCode={discountCode}
                            application={discount_applications?.find(
                                (a) => a.code === discountCode.code,
                            )}
                            moneySymbol={moneySymbol}
                        />
                    </Box>
                ))}
                {automaticApplications.map((application, index) => (
                    <Box
                        key={`${application.title}-${index}`}
                        className={
                            hasCodes || index > 0
                                ? css.discountDivider
                                : undefined
                        }
                    >
                        <AutomaticDiscountRow
                            application={application}
                            moneySymbol={moneySymbol}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
