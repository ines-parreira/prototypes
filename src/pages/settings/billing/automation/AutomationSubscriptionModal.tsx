import React, {ElementType} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {getEquivalentRegularPlanId} from 'models/billing/utils'
import {setFutureSubscriptionPlan} from 'state/billing/actions'
import {
    DEPRECATED_getCurrentPlan,
    getEquivalentAutomationCurrentPlan,
    getHasAutomationAddOn,
} from 'state/billing/selectors'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {hasAutomationLegacyFeatures} from 'state/currentAccount/selectors'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import AutomationSubscriptionDescription from './AutomationSubscriptionDescription'
import css from './AutomationSubscriptionModal.less'

type Props = {
    confirmLabel: string
    footer?: ElementType
    image?: string
    headerDescription?: string
    isOpen: boolean
    onClose: () => void
    onSubscribe?: () => void
    fade?: boolean
}
type FooterProps = {
    onConfirm: () => void
    isUpdating: boolean
}

const DefaultFooter = ({
    confirmLabel,
    isUpdating,
    onClose,
    onConfirm,
}: Pick<Props, 'confirmLabel' | 'onClose'> & FooterProps) => (
    <ModalFooter className={css.footer}>
        <Button intent="secondary" onClick={onClose}>
            Cancel
        </Button>
        <Button isLoading={isUpdating} onClick={onConfirm}>
            {confirmLabel}
        </Button>
    </ModalFooter>
)

const AutomationSubscriptionModal = ({
    confirmLabel,
    footer: Footer = DefaultFooter,
    image,
    headerDescription,
    isOpen,
    onClose,
    onSubscribe,
    fade = true,
}: Props) => {
    const dispatch = useAppDispatch()
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const automationPlan = useAppSelector(getEquivalentAutomationCurrentPlan)
    const isSelfServeLegacy = useAppSelector(hasAutomationLegacyFeatures)

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (planId) => {
            dispatch(setFutureSubscriptionPlan(planId))
            try {
                await dispatch(
                    updateSubscription({
                        plan: planId,
                    })
                )
                onClose()
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: error,
                    })
                )
            }
        }, [])

    const header = headerDescription
        ? headerDescription
        : hasAutomationAddOn
        ? 'Manage automation add-on'
        : isSelfServeLegacy
        ? 'Confirm automation add-on subscription'
        : 'Confirm automation subscription'

    const onConfirm = () => {
        automationPlan &&
            handleSubscriptionUpdate(automationPlan.get('id')).then(
                () => onSubscribe && onSubscribe()
            )
    }

    const handleUnsubscribeClick = () => {
        void handleSubscriptionUpdate(
            getEquivalentRegularPlanId(currentPlan.get('id') as string)
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            className={css.modal}
            fade={fade}
            centered
        >
            <ModalHeader toggle={onClose}>{header}</ModalHeader>
            <ModalBody
                className={css.modalBody}
                data-candu-id={
                    hasAutomationAddOn
                        ? 'cancel-automation-addon-modal-body'
                        : 'manage-automation-addon-modal-body'
                }
            >
                <AutomationSubscriptionDescription />
                {!!image && (
                    <img
                        alt="automation features"
                        src={image}
                        className={css.image}
                    />
                )}
            </ModalBody>
            {hasAutomationAddOn ? (
                <ModalFooter
                    className={classnames(css.footer, css.footerUnsubscribe)}
                >
                    <Button
                        intent="destructive"
                        onClick={handleUnsubscribeClick}
                        isLoading={isSubscriptionUpdating}
                    >
                        Cancel subscription
                    </Button>
                    <Button intent="secondary" onClick={onClose}>
                        OK
                    </Button>
                </ModalFooter>
            ) : (
                <Footer
                    confirmLabel={confirmLabel}
                    isUpdating={isSubscriptionUpdating}
                    onClose={onClose}
                    onConfirm={onConfirm}
                />
            )}
        </Modal>
    )
}

export default AutomationSubscriptionModal
