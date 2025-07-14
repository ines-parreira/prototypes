import { Badge, ColorType } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    FinancialStatus,
    FulfillmentStatus,
    ReturnStatus,
} from 'constants/integrations/types/shopify'
import { useFlag } from 'core/flags'
import { humanizeString } from 'utils'

type FulfillmentBadgeProps = {
    fulfillmentStatus: FulfillmentStatus
}

type FinancialBadgeProps = {
    financialStatus: FinancialStatus
}

type Props = {
    fulfillmentStatus: FulfillmentStatus
    financialStatus: FinancialStatus
    isInfluencedByAI: boolean
    isCancelled: boolean
    returnsStatus: ReturnStatus | null
}

type FulfillmentValues = Map<FulfillmentStatus | null, [ColorType, string]>
type FinancialValues = Map<FinancialStatus, ColorType>
type ReturnValues = Map<ReturnStatus, [ColorType, string]>

const fulfillmentValues: FulfillmentValues = new Map([
    [FulfillmentStatus.Fulfilled, ['light-success', 'Fulfilled']],
    [FulfillmentStatus.Partial, ['light-grey', 'Partially fulfilled']],
    [FulfillmentStatus.Restocked, ['light-warning', 'Restocked']],
    [null, ['light-grey', 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [FinancialStatus.Pending, 'light-grey'],
    [FinancialStatus.Authorized, 'light-grey'],
    [FinancialStatus.PartiallyPaid, 'light-success'],
    [FinancialStatus.Paid, 'light-success'],
    [FinancialStatus.PartiallyRefunded, 'light-warning'],
    [FinancialStatus.Refunded, 'light-error'],
    [FinancialStatus.Voided, 'light-error'],
])

const returnedValues: ReturnValues = new Map([
    ['PartialReturn', ['light-warning', 'Partially Returned']],
    ['FullReturn', ['light-error', 'Returned']],
])

export default function OrderStatus({
    fulfillmentStatus,
    financialStatus,
    isCancelled,
    isInfluencedByAI,
    returnsStatus,
}: Props) {
    const showReturnsStatusForOrders = useFlag(
        FeatureFlagKey.ShowReturnsStatusForOrders,
        false,
    )

    return (
        <>
            {isCancelled && <CancelledBadge />}
            <FinancialBadge financialStatus={financialStatus} />
            <FulfillmentBadge fulfillmentStatus={fulfillmentStatus} />
            {showReturnsStatusForOrders && returnsStatus && (
                <ReturnsBadge returnsStatus={returnsStatus} />
            )}
            {isInfluencedByAI && <InfluencedByAIBadge />}
        </>
    )
}

export function ReturnsBadge({
    returnsStatus,
}: {
    returnsStatus: ReturnStatus
}) {
    if (!returnsStatus) {
        return null
    }

    const [type, label] = returnedValues.get(returnsStatus) || []
    return <Badge type={type}>{label}</Badge>
}

function FulfillmentBadge({ fulfillmentStatus }: FulfillmentBadgeProps) {
    const [type, label] = fulfillmentValues.get(fulfillmentStatus) || []
    if (!type) {
        return null
    }
    return <Badge type={type}>{label}</Badge>
}

function FinancialBadge({ financialStatus }: FinancialBadgeProps) {
    const type = financialValues.get(financialStatus)
    if (!type) {
        return null
    }
    const financialLabel = humanizeString(financialStatus).replace(/_/g, ' ')

    return <Badge type={type}>{financialLabel}</Badge>
}

function CancelledBadge() {
    return <Badge type={'light-error'}>Cancelled</Badge>
}

function InfluencedByAIBadge() {
    return (
        <Badge
            style={{
                backgroundColor: 'var(--accessory-magenta-25)',
                background:
                    'linear-gradient(90deg, rgba(203, 85, 239, 0.8) -12%, rgba(111, 12, 134, 0.8) 120%)',
                color: 'white',
            }}
        >
            Influenced by AI
        </Badge>
    )
}
