import React, {ComponentProps, ReactNode, MouseEventHandler} from 'react'
import {useSelector} from 'react-redux'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'

import ArrowForward from 'assets/img/icons/arrow-forward.svg'

import {
    getAddOnAutomationAmountCurrentPlan,
    getCurrentPlan,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
} from '../../../../state/billing/selectors'
import SynchronizedScrollTopProvider from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import BillingPlanCard from './BillingPlanCard'
import CurrentPlanBadge from './CurrentPlanBadge'
import PlanCard, {PlanCardTheme} from './PlanCard'
import RecurringPrices from './RecurringPrices'
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
    const currentPlan = useSelector(getCurrentPlan)
    const regularCurrentPlan = useSelector(getEquivalentRegularCurrentPlan)
    const plan = regularCurrentPlan || currentPlan
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    const addOnAmountCurrentPlan = useSelector(
        getAddOnAutomationAmountCurrentPlan
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
                                        <RecurringPrices
                                            addOnAmount={addOnAmountCurrentPlan}
                                            plan={plan.toJS()}
                                            isAutomationChecked={
                                                hasAutomationAddOn
                                            }
                                        />
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
                    <Button color="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onClick={onConfirm}
                        className={classnames({
                            'btn-loading': isUpdating,
                        })}
                    >
                        {confirmLabel}
                    </Button>
                </ModalFooter>
            </Modal>
        </SynchronizedScrollTopProvider>
    )
}

export default ChangePlanModal
