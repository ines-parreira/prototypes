import React, {ComponentProps, ReactNode, MouseEventHandler} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {Map} from 'immutable'

import ArrowForward from '../../../../../img/icons/arrow-forward.svg'
import SynchronizedScrollTopProvider from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import PlanCard, {PlanCardTheme} from './PlanCard'
import BillingPlanCard from './BillingPlanCard'
import CurrentPlanBadge from './CurrentPlanBadge'
import css from './ChangePlanModal.less'

type Props = {
    confirmLabel: string
    currentPlan: Map<any, any>
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
    currentPlan,
    description,
    header,
    isOpen,
    isUpdating,
    onClose,
    onConfirm,
    renderComparedPlan,
}: Props) => (
    <SynchronizedScrollTopProvider>
        <Modal isOpen={isOpen} toggle={onClose} className={css.modal} centered>
            <ModalHeader toggle={onClose}>{header}</ModalHeader>
            <ModalBody className="p-0">
                <div className="m-3">{description}</div>
                <div className="m-3 flex justify-content-between">
                    <BillingPlanCard
                        isCurrentPlan
                        theme={PlanCardTheme.Grey}
                        plan={currentPlan.toJS()}
                        renderBody={(features) => (
                            <SynchronizedScrollTopContainer height={280}>
                                {features}
                            </SynchronizedScrollTopContainer>
                        )}
                        headerBadge={
                            <CurrentPlanBadge
                                planName={currentPlan.get('name')}
                            />
                        }
                        className={css.plan}
                    />
                    <img src={ArrowForward} alt="arrow-icon" />
                    {renderComparedPlan({
                        className: css.plan,
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

export default ChangePlanModal
