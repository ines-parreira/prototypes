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
    getCurrentHelpdeskPlan,
    getCurrentAutomatePlan,
    getAvailableAutomatePlansMap,
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
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const availableAutomatePlansMap = useAppSelector(
        getAvailableAutomatePlansMap
    )
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentHelpdeskAddons = useAppSelector(getCurrentHelpdeskAddons)
    const features = useMemo(
        () =>
            currentHelpdeskPlan
                ? getPlanCardFeaturesForPrices([currentHelpdeskPlan], false)
                : [],
        [currentHelpdeskPlan]
    )

    const currentHelpdeskAutomateAmount = useAppSelector(
        getCurrentHelpdeskAutomateAmount
    )
    const currentAutomationFullAmount = useAppSelector(
        getCurrentAutomationFullAmount
    )
    const isEditable = useMemo(
        () =>
            currentAutomatePlan != null ||
            currentHelpdeskAddons?.some(
                (priceId) => !!availableAutomatePlansMap[priceId]
            ),
        [currentAutomatePlan, currentHelpdeskAddons, availableAutomatePlansMap]
    )
    const appNode = useAppNode()

    const formattedName =
        currentHelpdeskPlan &&
        convertLegacyPlanNameToPublicPlanName(currentHelpdeskPlan.name)
    const formattedAmount =
        currentHelpdeskPlan && getFormattedAmount(currentHelpdeskPlan.amount)

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
                            'justify-content-center': !currentHelpdeskPlan,
                            'justify-content-between': !!currentHelpdeskPlan,
                        })}
                    >
                        {currentHelpdeskPlan &&
                            formattedName &&
                            formattedAmount && (
                                <>
                                    <BillingPlanCard
                                        amount={formattedAmount}
                                        currency={currentHelpdeskPlan.currency}
                                        interval={currentHelpdeskPlan.interval}
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
                                                <AutomateAmount
                                                    addOnAmount={
                                                        currentHelpdeskAutomateAmount
                                                    }
                                                    currency={
                                                        currentHelpdeskPlan.currency
                                                    }
                                                    editable={isEditable}
                                                    interval={
                                                        currentHelpdeskPlan.interval
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
                                                        currentHelpdeskPlan.currency
                                                    }
                                                    interval={
                                                        currentHelpdeskPlan.interval
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
                                [`${css.isSinglePlan}`]: !currentHelpdeskPlan,
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
