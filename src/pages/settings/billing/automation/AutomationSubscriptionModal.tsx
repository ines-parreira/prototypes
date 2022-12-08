import React, {ElementType} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    getCurrentHelpdeskProduct,
    getHasAutomationAddOn,
} from 'state/billing/selectors'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
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
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({prices}))
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
        : 'Confirm automation add-on subscription'

    const onConfirm = () => {
        helpdeskPrice?.addons &&
            handleSubscriptionUpdate([
                helpdeskPrice.price_id,
                helpdeskPrice.addons[0],
            ]).then(() => onSubscribe && onSubscribe())
    }

    const handleUnsubscribeClick = () => {
        helpdeskPrice && void handleSubscriptionUpdate([helpdeskPrice.price_id])
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
