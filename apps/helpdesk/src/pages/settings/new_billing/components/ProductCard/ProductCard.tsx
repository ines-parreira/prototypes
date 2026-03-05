import { useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import moment from 'moment'
import { useHistory } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { Plan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    getProductInfo,
    isConvert,
    isEnterprise,
    isLegacyAutomate,
    isTrial,
    isYearlyContractPlan,
} from 'models/billing/utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import {
    getCheapestProductPlans,
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import type { BillingBanner, CurrentUsagePerProduct } from 'state/billing/types'
import { TicketPurpose } from 'state/billing/types'

import { BILLING_PROCESS_PATH, DATE_FORMAT } from '../../constants'
import { formatAmount, formatNumTickets } from '../../utils/formatAmount'
import Badge, { BadgeType } from '../Badge/Badge'

import css from './ProductCard.less'

export type ProductCardProps = {
    type: ProductType
    plan: Plan | undefined
    usage?: CurrentUsagePerProduct | null
    banner?: BillingBanner | null
    isDisabled: boolean
    disabledTooltip?: string
    autoUpgradeEnabled?: boolean | null
    scheduledToCancelAt?: string | null
    isLoading?: boolean
    tooltipDisabledCTACallback: (ticketPurpose: TicketPurpose) => void
}

const ContactUsTooltip = ({
    type,
    tooltipDisabledCTACallback,
}: Pick<ProductCardProps, 'type' | 'tooltipDisabledCTACallback'>) => (
    <Tooltip
        placement="top"
        target={`productCardButton_${type}`}
        autohide={false}
    >
        <>
            Because you&apos;re on a custom plan, please{' '}
            <span
                className={css.link}
                onClick={() =>
                    tooltipDisabledCTACallback(TicketPurpose.CONTACT_US)
                }
            >
                contact our team
            </span>{' '}
            to make changes.
        </>
    </Tooltip>
)
const ProductCard = ({
    type,
    plan,
    usage,
    banner,
    isDisabled,
    disabledTooltip,
    autoUpgradeEnabled = false,
    scheduledToCancelAt,
    isLoading = false,
    tooltipDisabledCTACallback,
}: ProductCardProps) => {
    const cheapestPlanByProduct = useAppSelector(getCheapestProductPlans)
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const history = useHistory()
    const productInfo = getProductInfo(type, plan)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)

    const { className, canduOverageStatus } = useMemo(() => {
        if (
            !usage ||
            !plan?.num_quota_tickets ||
            usage.data.num_tickets < 0.8 * (plan?.num_quota_tickets || 0)
        ) {
            return {
                className: '',
                canduOverageStatus: 'info',
            }
        }

        if (usage.data.num_tickets < (plan?.num_quota_tickets || 0)) {
            return {
                className: css.warning,
                canduOverageStatus: 'warning',
            }
        }

        return {
            className: css.danger,
            canduOverageStatus: 'danger',
        }
    }, [usage, plan])

    const currentStatus = useMemo(() => {
        if (!plan) {
            return null
        }

        if (plan && isTrial(plan)) {
            return (
                <>
                    <strong>{getOverageUnitPriceFormatted(plan)}</strong>{' '}
                    {productInfo.perTicket}
                </>
            )
        }

        return (
            <>
                {type === ProductType.Helpdesk && <>{plan.name} - </>}
                <b>{getPlanPriceFormatted(plan)}</b>/{plan.invoice_cadence}
            </>
        )
    }, [plan, type, productInfo])

    const subscribeContainer = useMemo(() => {
        return (
            <div className={css.subscribeContainer}>
                {cadence && !isYearlyPlan && (
                    <div>
                        Starting at{' '}
                        <b>
                            {getPlanPriceFormatted(cheapestPlanByProduct[type])}
                        </b>
                        /{cadence}
                    </div>
                )}
                {isDisabled && disabledTooltip && (
                    <Tooltip
                        placement="top"
                        target={`productCardButton_${type}`}
                    >
                        {disabledTooltip}
                    </Tooltip>
                )}

                {isYearlyPlan && (
                    <ContactUsTooltip
                        type={type}
                        tooltipDisabledCTACallback={tooltipDisabledCTACallback}
                    />
                )}

                <Button
                    intent="primary"
                    isDisabled={isDisabled || isYearlyPlan}
                    onClick={() => {
                        const url = `${BILLING_PROCESS_PATH}/${type}`
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansSubscribeProductClicked,
                            { url: url },
                        )
                        history.push(url)
                    }}
                    id={`productCardButton_${type}`}
                >
                    {isDisabled && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.disabledLock,
                            )}
                        >
                            lock
                        </i>
                    )}
                    Subscribe
                </Button>
            </div>
        )
    }, [
        cheapestPlanByProduct,
        type,
        cadence,
        history,
        isDisabled,
        disabledTooltip,
        tooltipDisabledCTACallback,
        isYearlyPlan,
    ])

    const updateContainer = useMemo(
        () => (
            <>
                {isDisabled && disabledTooltip && (
                    <Tooltip
                        placement="top"
                        target={`productCardButton_${type}`}
                    >
                        {disabledTooltip}
                    </Tooltip>
                )}
                {isYearlyPlan && (
                    <ContactUsTooltip
                        type={type}
                        tooltipDisabledCTACallback={tooltipDisabledCTACallback}
                    />
                )}
                <Button
                    intent="secondary"
                    isDisabled={isYearlyPlan || isDisabled}
                    onClick={() => {
                        const url = `${BILLING_PROCESS_PATH}/${type}`
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansManageProductClicked,
                            { url: url },
                        )
                        history.push(url)
                    }}
                    id={`productCardButton_${type}`}
                >
                    Manage
                </Button>
            </>
        ),
        [
            history,
            type,
            tooltipDisabledCTACallback,
            isYearlyPlan,
            isDisabled,
            disabledTooltip,
        ],
    )

    const counter = useMemo(() => {
        if (plan && isLegacyAutomate(plan)) {
            return null
        }

        return (
            <div className={classNames(css.counter)}>
                {plan && isTrial(plan) ? (
                    <div className={className}>
                        {usage ? formatNumTickets(usage.data.num_tickets) : 0}{' '}
                        {productInfo.counter} used
                    </div>
                ) : (
                    <div className={className}>
                        {usage ? formatNumTickets(usage.data.num_tickets) : 0}{' '}
                        of {formatNumTickets(plan?.num_quota_tickets || 0)}{' '}
                        {productInfo.counter} used
                    </div>
                )}
                <i className="material-icons" id={`info_${type}`}>
                    info_outlined
                </i>
                <Tooltip
                    target={`info_${type}`}
                    placement="top-start"
                    className={css.tooltip}
                    autohide={false}
                >
                    {productInfo.tooltip}
                    <a
                        href={productInfo.tooltipLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Learn more
                    </a>
                </Tooltip>
            </div>
        )
    }, [plan, type, usage, className, productInfo])

    const extraCost = useMemo(() => {
        if (plan && (isLegacyAutomate(plan) || isConvert(plan))) {
            return null
        }

        return (
            <div className={css.extraCost}>
                {formatAmount(
                    (usage?.data.extra_tickets_cost_in_cents ?? 0) / 100,
                )}{' '}
                extra cost
            </div>
        )
    }, [plan, usage])

    const statusBadge = useMemo(() => {
        if (isLoading) {
            return null
        }
        if (!plan) {
            return <Badge text="Inactive" type={BadgeType.Info} />
        }

        if (scheduledToCancelAt) {
            const formattedDate =
                moment(scheduledToCancelAt).format(DATE_FORMAT)
            return (
                <Badge
                    text={`Active until ${formattedDate}`}
                    type={BadgeType.Warning}
                />
            )
        }

        return <Badge text="Active" type={BadgeType.Success} />
    }, [plan, scheduledToCancelAt, isLoading])

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>
                    <i
                        className={classNames('material-icons', {
                            [css.activeIcon]: !!plan,
                        })}
                    >
                        {productInfo.icon}
                    </i>
                    <div>{productInfo.title}</div>
                    {statusBadge}
                </div>
                <div>{currentStatus}</div>
            </div>
            <div className={css.body}>
                <div
                    data-candu-id={`billing-${type}-description-${canduOverageStatus}`}
                >
                    {banner && (
                        <Alert
                            icon
                            type={banner.type}
                            customActions={
                                banner.type === AlertType.Info && (
                                    <a
                                        href={productInfo.bannerLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Set up {productInfo.title}
                                    </a>
                                )
                            }
                        >
                            {banner.description}
                        </Alert>
                    )}
                </div>
            </div>
            <div className={css.footer}>
                <div>{!!plan ? updateContainer : subscribeContainer}</div>
                <div>
                    {!!plan && counter}

                    {plan && isConvert(plan) && !isEnterprise(plan) ? (
                        <div className={css.autoUpgradeLabel}>
                            Auto-upgrade
                            {autoUpgradeEnabled ? ' enabled ' : ' disabled '}
                            <a
                                href="https://link.gorgias.com/5015d3"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more
                            </a>
                        </div>
                    ) : (
                        <>{!!plan && extraCost}</>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard
