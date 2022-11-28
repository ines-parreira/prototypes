import React, {
    ComponentProps,
    MouseEventHandler,
    ReactNode,
    useMemo,
} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'

import ArrowForward from 'assets/img/icons/arrow-forward.svg'
import {getFormattedAmount} from 'models/billing/utils'
import {
    getCurrentHelpdeskAutomationAddonAmount,
    getCurrentAutomationFullAmount,
    getHasAutomationAddOn,
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
import AutomationAmount from './AutomationAmount'

import css from './ChangePlanModal.less'
import {getPlanCardFeaturesForPrices} from './billingPlanFeatures'

type Props = {
    confirmLabel: string
    description: ReactNode
    header: ReactNode
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
    isOpen,
    isUpdating,
    onClose,
    onConfirm,
    renderComparedPlan,
}: Props) => {
    const currentHelpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentAutomationPrice = useAppSelector(getCurrentAutomationProduct)
    const automationPrices = useAppSelector(getAutomationPricesMap)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const currentHelpdeskAddons = useAppSelector(getCurrentHelpdeskAddons)
    const features = useMemo(
        () =>
            currentHelpdeskPrice
                ? getPlanCardFeaturesForPrices([currentHelpdeskPrice], false)
                : [],
        [currentHelpdeskPrice]
    )

    const addOnAmountCurrentPlan = useAppSelector(
        getCurrentHelpdeskAutomationAddonAmount
    )
    const addOnFullAmountCurrentPlan = useAppSelector(
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
                                        isCurrentPlan
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
                                                <AutomationAmount
                                                    addOnAmount={
                                                        addOnAmountCurrentPlan
                                                    }
                                                    currency={
                                                        currentHelpdeskPrice.currency
                                                    }
                                                    editable={isEditable}
                                                    interval={
                                                        currentHelpdeskPrice.interval
                                                    }
                                                    fullAddOnAmount={
                                                        addOnFullAmountCurrentPlan
                                                    }
                                                    isAutomationChecked={
                                                        hasAutomationAddOn
                                                    }
                                                />
                                                <TotalAmount
                                                    addOnAmount={
                                                        addOnAmountCurrentPlan
                                                    }
                                                    amount={formattedAmount}
                                                    currency={
                                                        currentHelpdeskPrice.currency
                                                    }
                                                    interval={
                                                        currentHelpdeskPrice.interval
                                                    }
                                                    isAutomationChecked={
                                                        hasAutomationAddOn
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
