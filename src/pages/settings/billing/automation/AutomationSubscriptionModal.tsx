import React, {ElementType} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'

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
import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import AutomationSubscriptionDescription from './AutomationSubscriptionDescription'
import css from './AutomationSubscriptionModal.less'

type Props = {
    confirmLabel: string
    footer?: ElementType
    image?: string
    headerDescription?: string
    isOpen: boolean
    onClose: () => void
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
        <Button type="button" intent={ButtonIntent.Secondary} onClick={onClose}>
            Cancel
        </Button>
        <Button type="button" isLoading={isUpdating} onClick={onConfirm}>
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
}: Props) => {
    const dispatch = useAppDispatch()
    const currentPlan = useSelector(DEPRECATED_getCurrentPlan)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const automationPlan = useSelector(getEquivalentAutomationCurrentPlan)
    const isSelfServeLegacy = useSelector(hasAutomationLegacyFeatures)

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

    const onConfirm = () =>
        automationPlan && handleSubscriptionUpdate(automationPlan.get('id'))

    const handleUnsubscribeClick = () => {
        void handleSubscriptionUpdate(
            getEquivalentRegularPlanId(currentPlan.get('id') as string)
        )
    }

    return (
        <Modal isOpen={isOpen} toggle={onClose} className={css.modal} centered>
            <ModalHeader toggle={onClose}>{header}</ModalHeader>
            <ModalBody className={css.modalBody}>
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
                        type="button"
                        intent={ButtonIntent.Destructive}
                        onClick={handleUnsubscribeClick}
                        isLoading={isSubscriptionUpdating}
                    >
                        Cancel subscription
                    </Button>
                    <Button
                        type="button"
                        intent={ButtonIntent.Secondary}
                        onClick={onClose}
                    >
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
