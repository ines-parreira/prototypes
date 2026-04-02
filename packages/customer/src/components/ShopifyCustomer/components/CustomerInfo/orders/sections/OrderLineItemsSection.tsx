import type {
    OrderCardProduct,
    OrderLineItem,
} from '@repo/ecommerce/shopify/types'

import { Box } from '@gorgias/axiom'

import type { OrderRefund, OrderReturn } from '../../../../types'
import { DefaultPricingSection } from './DefaultPricingSection'
import { groupOrderLineItems } from './groupOrderLineItems'
import { LineItemGroupHeader } from './LineItemGroupHeader'
import { LineItemRow } from './LineItemRow'
import { RefundPricingSection } from './RefundPricingSection'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    lineItems: OrderLineItem[]
    productsMap?: Map<number, OrderCardProduct>
    moneySymbol: string
    subtotalPrice?: string
    totalShippingPrice?: string
    totalDiscounts?: string
    totalTax?: string
    totalPrice?: string
    currentTotalPrice?: string
    refunds?: OrderRefund[]
    returns?: OrderReturn[]
}

export function OrderLineItemsSection({
    lineItems,
    productsMap,
    moneySymbol,
    subtotalPrice,
    totalShippingPrice,
    totalDiscounts,
    totalTax,
    totalPrice,
    currentTotalPrice,
    refunds,
    returns,
}: Props) {
    if (lineItems.length === 0) return null

    const groups = groupOrderLineItems(lineItems, refunds, returns)
    const hasRefunds = refunds && refunds.length > 0

    const sections = [
        { title: 'Line items', items: groups.active, isStrikethrough: false },
        {
            title: 'Return in progress',
            items: groups.returnInProgress,
            isStrikethrough: true,
        },
        {
            title: 'Return closed',
            items: groups.returnClosed,
            isStrikethrough: true,
        },
        { title: 'Removed', items: groups.removed, isStrikethrough: true },
    ]

    let isFirstRendered = true

    return (
        <Box mt="sm" className={css.section} display="block" padding="sm">
            <Box flexDirection="column">
                {sections.map((section) => {
                    if (section.items.length === 0) return null

                    const showDivider = !isFirstRendered
                    isFirstRendered = false

                    return (
                        <Box
                            key={section.title}
                            flexDirection="column"
                            className={
                                showDivider ? css.groupDivider : undefined
                            }
                        >
                            <LineItemGroupHeader
                                title={section.title}
                                count={section.items.length}
                            />
                            {section.items.map((item, index) => (
                                <LineItemRow
                                    key={item.lineItem.id ?? index}
                                    item={item}
                                    productsMap={productsMap}
                                    moneySymbol={moneySymbol}
                                    isStrikethrough={section.isStrikethrough}
                                />
                            ))}
                        </Box>
                    )
                })}

                {hasRefunds ? (
                    <RefundPricingSection
                        subtotalPrice={subtotalPrice}
                        totalShippingPrice={totalShippingPrice}
                        totalDiscounts={totalDiscounts}
                        totalTax={totalTax}
                        totalPrice={totalPrice}
                        currentTotalPrice={currentTotalPrice}
                        moneySymbol={moneySymbol}
                        refunds={refunds}
                    />
                ) : (
                    <DefaultPricingSection
                        subtotalPrice={subtotalPrice}
                        totalShippingPrice={totalShippingPrice}
                        totalDiscounts={totalDiscounts}
                        totalTax={totalTax}
                        totalPrice={totalPrice}
                        moneySymbol={moneySymbol}
                    />
                )}
            </Box>
        </Box>
    )
}
