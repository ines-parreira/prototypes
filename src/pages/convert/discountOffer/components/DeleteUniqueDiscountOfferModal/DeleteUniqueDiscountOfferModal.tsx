import React, { FC, MouseEvent } from 'react'

import { List, Map } from 'immutable'
// eslint-disable-next-line no-restricted-imports
import { useDispatch } from 'react-redux'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { useAppNode } from 'appNode'
import { AttachmentEnum } from 'common/types'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import { UniqueDiscountOffer } from 'models/convert/discountOffer/types'
import { DELETE_DISCOUNT_MODAL_NAME } from 'models/discountCodes/constants'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import { useDeleteDiscountOffer } from 'pages/convert/discountOffer/hooks/useDeleteDiscountOffer'
import { deleteAttachment } from 'state/newMessage/actions'
import { getNewMessageAttachments } from 'state/newMessage/selectors'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const DeleteUniqueDiscountOfferModal: FC<Props> = (props) => {
    const { isOpen, onClose } = props
    const newMessageAttachments: List<any> = useAppSelector(
        getNewMessageAttachments,
    )
    const dispatch = useDispatch()

    const deleteModalManager = useModalManager(DELETE_DISCOUNT_MODAL_NAME)

    const modalParams = deleteModalManager.getParams() as UniqueDiscountOffer

    const appNode = useAppNode()

    const { mutateAsync: deleteDiscountOfferAsync } = useDeleteDiscountOffer(
        modalParams?.prefix || '',
    )

    const onDeleteDiscountOffer = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!modalParams?.id) return

        await deleteDiscountOfferAsync([
            undefined,
            { discount_offer_id: modalParams.id },
        ])

        // After deletion, check if the deleted discountOffer is among new message attachments and remove it
        if (!newMessageAttachments.isEmpty()) {
            const currentlyDeletedOfferAttachmentIndex =
                newMessageAttachments.findIndex(
                    (att: Map<string, any>) =>
                        att?.get('content_type') ===
                            AttachmentEnum.DiscountOffer &&
                        att?.getIn(['extra', 'discount_offer_id']) ===
                            modalParams?.id,
                )

            if (currentlyDeletedOfferAttachmentIndex > -1) {
                dispatch(deleteAttachment(currentlyDeletedOfferAttachmentIndex))
            }
        }
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            autoFocus
            backdrop="static"
            size="lg"
            // it has to be above popover which is currently set to 1560
            zIndex={1561}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onClose}>
                Delete {`"${modalParams?.prefix}"` || 'the'} discount code offer
            </ModalHeader>

            <ModalBody>
                If you delete this offer, all campaigns containing this discount
                code offer won’t be displayed anymore to your visitors.The
                unique discount codes generated today from this offer will stay
                valid for the next 48 hours.
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" className="mr-2" onClick={onClose}>
                    Back
                </Button>
                <Button intent="destructive" onClick={onDeleteDiscountOffer}>
                    Delete Code
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
