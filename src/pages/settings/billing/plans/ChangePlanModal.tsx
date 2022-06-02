import React, {ComponentProps, MouseEventHandler, ReactNode} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'

import ArrowForward from 'assets/img/icons/arrow-forward.svg'
import {
    DEPRECATED_getCurrentPlan,
    getAddOnAutomationAmountCurrentPlan,
    getAddOnAutomationFullAmountCurrentPlan,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
} from 'state/billing/selectors'
import SynchronizedScrollTopProvider from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import BillingPlanCard from './BillingPlanCard'
import CurrentPlanBadge from './CurrentPlanBadge'
import PlanCard, {PlanCardTheme} from './PlanCard'
import TotalAmount from './TotalAmount'
import AutomationAmount from './AutomationAmount'

import css from './ChangePlanModal.less'

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
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const regularCurrentPlan = useAppSelector(getEquivalentRegularCurrentPlan)
    const plan = regularCurrentPlan || currentPlan
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const addOnAmountCurrentPlan = useAppSelector(
        getAddOnAutomationAmountCurrentPlan
    )
    const addOnFullAmountCurrentPlan = useAppSelector(
        getAddOnAutomationFullAmountCurrentPlan
    )

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
                            'justify-content-center': plan.isEmpty(),
                            'justify-content-between': !plan.isEmpty(),
                        })}
                    >
                        {!plan.isEmpty() && (
                            <>
                                <BillingPlanCard
                                    isCurrentPlan
                                    theme={PlanCardTheme.Grey}
                                    plan={plan.toJS()}
                                    featuresPlan={currentPlan.toJS()}
                                    renderBody={(features) => (
                                        <SynchronizedScrollTopContainer
                                            height={280}
                                        >
                                            {features}
                                        </SynchronizedScrollTopContainer>
                                    )}
                                    headerBadge={
                                        <CurrentPlanBadge
                                            planName={plan.get('name')}
                                        />
                                    }
                                    className={css.plan}
                                    footer={
                                        <>
                                            <AutomationAmount
                                                addOnAmount={
                                                    addOnAmountCurrentPlan
                                                }
                                                fullAddOnAmount={
                                                    addOnFullAmountCurrentPlan
                                                }
                                                plan={plan.toJS()}
                                                isAutomationChecked={
                                                    hasAutomationAddOn
                                                }
                                            />
                                            <TotalAmount
                                                addOnAmount={
                                                    addOnAmountCurrentPlan
                                                }
                                                plan={plan.toJS()}
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
                                [`${css.isSinglePlan}`]: plan.isEmpty(),
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
