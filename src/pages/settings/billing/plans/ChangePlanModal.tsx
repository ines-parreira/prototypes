import React, {
    ComponentProps,
    MouseEventHandler,
    ReactNode,
    useMemo,
} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'

import {useAppNode} from 'appNode'
import ArrowForward from 'assets/img/icons/arrow-forward.svg'
import {getFormattedAmount} from 'models/billing/utils'
import {
    getCurrentHelpdeskAutomateAmount,
    getCurrentAutomationFullAmount,
    getHasAutomate,
    getCurrentHelpdeskProduct,
    getCurrentAutomationProduct,
    getAutomationPricesMap,
    getCurrentHelpdeskAddons,
} from 'state/billing/selectors'
import SynchronizedScrollTopProvider from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import BillingPlanCard from './BillingPlanCard'
import CurrentPlanBadge from './CurrentPlanBadge'
import PlanCard, {PlanCardTheme} from './PlanCard'
import TotalAmount from './TotalAmount'
import AutomateAmount from './AutomateAmount'

import css from './ChangePlanModal.less'
import {getPlanCardFeaturesForPrices} from './billingPlanFeatures'

type Props = {
    confirmLabel: string
    description: ReactNode
    header: ReactNode
    isDowngrade?: boolean
    isOpen: boolean
    isUpdating: boolean
    onClose: () => void
    onConfirm: MouseEventHandler<HTMLButtonElement>
    renderComparedPlan: (
        planCardProps: Pick<
            ComponentProps<typeof PlanCard>,
            'className' | 'renderBody'
        >
    ) => ReactNode
}

export const ChangePlanModal = ({
    confirmLabel,
    description,
    header,
    isDowngrade = false,
    isOpen,
    isUpdating,
    onClose,
    onConfirm,
    renderComparedPlan,
}: Props) => {
    const currentHelpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentAutomationPrice = useAppSelector(getCurrentAutomationProduct)
    const automationPrices = useAppSelector(getAutomationPricesMap)
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentHelpdeskAddons = useAppSelector(getCurrentHelpdeskAddons)
    const features = useMemo(
        () =>
            currentHelpdeskPrice
                ? getPlanCardFeaturesForPrices([currentHelpdeskPrice], false)
                : [],
        [currentHelpdeskPrice]
    )

    const currentHelpdeskAutomateAmount = useAppSelector(
        getCurrentHelpdeskAutomateAmount
    )
    const currentAutomationFullAmount = useAppSelector(
        getCurrentAutomationFullAmount
    )
    const isEditable = useMemo(
        () =>
            currentAutomationPrice != null ||
            currentHelpdeskAddons?.some(
                (priceId) => !!automationPrices[priceId]
            ),
        [currentAutomationPrice, currentHelpdeskAddons, automationPrices]
    )
    const appNode = useAppNode()

    const formattedName =
        currentHelpdeskPrice &&
        convertLegacyPlanNameToPublicPlanName(currentHelpdeskPrice.name)
    const formattedAmount =
        currentHelpdeskPrice && getFormattedAmount(currentHelpdeskPrice.amount)

    return (
        <SynchronizedScrollTopProvider>
            <Modal
                isOpen={isOpen}
                toggle={onClose}
                className={css.modal}
                centered
                container={appNode ?? undefined}
            >
                <ModalHeader toggle={onClose}>{header}</ModalHeader>
                <ModalBody className="p-0">
                    <div className="m-3">{description}</div>
                    <div
                        className={classnames('m-3 flex', {
                            'justify-content-center': !currentHelpdeskPrice,
                            'justify-content-between': !!currentHelpdeskPrice,
                        })}
                    >
                        {currentHelpdeskPrice &&
                            formattedName &&
                            formattedAmount && (
                                <>
                                    <BillingPlanCard
                                        amount={formattedAmount}
                                        currency={currentHelpdeskPrice.currency}
                                        interval={currentHelpdeskPrice.interval}
                                        name={formattedName}
                                        features={features}
                                        isCurrentPrice
                                        theme={PlanCardTheme.Grey}
                                        renderBody={(features) => (
                                            <SynchronizedScrollTopContainer
                                                height={280}
                                            >
                                                {features}
                                            </SynchronizedScrollTopContainer>
                                        )}
                                        headerBadge={
                                            <CurrentPlanBadge
                                                planName={formattedName}
                                            />
                                        }
                                        className={css.plan}
                                        footer={
                                            <>
                                                <AutomateAmount
                                                    addOnAmount={
                                                        currentHelpdeskAutomateAmount
                                                    }
                                                    currency={
                                                        currentHelpdeskPrice.currency
                                                    }
                                                    editable={isEditable}
                                                    interval={
                                                        currentHelpdeskPrice.interval
                                                    }
                                                    fullAddOnAmount={
                                                        currentAutomationFullAmount
                                                    }
                                                    isAutomationChecked={
                                                        hasAutomate
                                                    }
                                                />
                                                <TotalAmount
                                                    addOnAmount={
                                                        currentHelpdeskAutomateAmount
                                                    }
                                                    amount={formattedAmount}
                                                    currency={
                                                        currentHelpdeskPrice.currency
                                                    }
                                                    interval={
                                                        currentHelpdeskPrice.interval
                                                    }
                                                    isAutomationChecked={
                                                        hasAutomate
                                                    }
                                                />
                                            </>
                                        }
                                    />
                                    <img src={ArrowForward} alt="arrow-icon" />
                                </>
                            )}
                        {renderComparedPlan({
                            className: classnames(css.plan, {
                                [`${css.isSinglePlan}`]: !currentHelpdeskPrice,
                            }),
                            renderBody: (body) => (
                                <SynchronizedScrollTopContainer height={280}>
                                    {body}
                                </SynchronizedScrollTopContainer>
                            ),
                        })}
                    </div>
                    {isDowngrade && (
                        <p className={classnames(css.downgrade, 'm-3')}>
                            The change in your subscription will take effect at
                            the end of your billing cycle.
                        </p>
                    )}
                </ModalBody>
                <ModalFooter className={css.footer}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button isDisabled={isUpdating} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </ModalFooter>
            </Modal>
        </SynchronizedScrollTopProvider>
    )
}

export default ChangePlanModal
