import type {
    CancellationDates,
    PlansByProduct,
    SelectedPlans,
} from '@repo/billing'

import { Box, Text } from '@gorgias/axiom'

import type { Cadence } from 'models/billing/types'
import { ProductType } from 'models/billing/types'

import { SummaryItem } from '../SummaryItem'
import SummaryTotal from '../SummaryTotal'

type BillingSummaryBreakdownProps = {
    selectedPlans: SelectedPlans
    cadence: Cadence
    plansByProduct: PlansByProduct
    totalProductAmount: number
    totalCancelledAmount: number
    cancelledProducts: ProductType[]
    currency: string
    cancellationDates?: CancellationDates
}

export function BillingSummaryBreakdown({
    selectedPlans,
    cadence,
    plansByProduct,
    totalProductAmount,
    totalCancelledAmount,
    cancelledProducts,
    currency,
    cancellationDates = {},
}: BillingSummaryBreakdownProps) {
    return (
        <>
            <Box
                justifyContent="space-between"
                alignItems="center"
                marginBottom="md"
            >
                <Text color="content-neutral-tertiary" size="sm" variant="bold">
                    PRODUCT
                </Text>
                <Text color="content-neutral-tertiary" size="sm" variant="bold">
                    PRICE
                </Text>
            </Box>
            <SummaryItem
                productType={ProductType.Helpdesk}
                cadence={cadence}
                currentPlan={plansByProduct[ProductType.Helpdesk].current}
                availablePlans={plansByProduct[ProductType.Helpdesk].available}
                selectedPlans={selectedPlans}
                scheduledToCancelAt={cancellationDates[ProductType.Helpdesk]}
            />
            <SummaryItem
                productType={ProductType.Automation}
                cadence={cadence}
                currentPlan={plansByProduct[ProductType.Automation].current}
                availablePlans={
                    plansByProduct[ProductType.Automation].available
                }
                selectedPlans={selectedPlans}
                scheduledToCancelAt={cancellationDates[ProductType.Automation]}
            />
            <SummaryItem
                productType={ProductType.Voice}
                cadence={cadence}
                currentPlan={plansByProduct[ProductType.Voice].current}
                availablePlans={plansByProduct[ProductType.Voice].available}
                selectedPlans={selectedPlans}
                scheduledToCancelAt={cancellationDates[ProductType.Voice]}
            />
            <SummaryItem
                productType={ProductType.SMS}
                cadence={cadence}
                currentPlan={plansByProduct[ProductType.SMS].current}
                availablePlans={plansByProduct[ProductType.SMS].available}
                selectedPlans={selectedPlans}
                scheduledToCancelAt={cancellationDates[ProductType.SMS]}
            />
            <SummaryItem
                productType={ProductType.Convert}
                cadence={cadence}
                currentPlan={plansByProduct[ProductType.Convert].current}
                availablePlans={plansByProduct[ProductType.Convert].available}
                selectedPlans={selectedPlans}
                scheduledToCancelAt={cancellationDates[ProductType.Convert]}
            />
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                totalCancelledAmount={totalCancelledAmount}
                cancelledProducts={cancelledProducts}
                cadence={cadence}
                currency={currency}
            />
        </>
    )
}
