import React from 'react'
import {Map} from 'immutable'
import {Modal} from 'reactstrap'
import {useAppNode} from 'appNode'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'

export type UniqueDiscountOfferCreateModalProps = {
    isOpen: boolean
    integration: Map<string, string>
    onClose: any
    onSubmit: (code: UniqueDiscountOffer) => void
}
export const UniqueDiscountOfferCreateModal: React.FC<UniqueDiscountOfferCreateModalProps> =
    (props) => {
        const {isOpen, onClose} = props

        const appNode = useAppNode()

        return (
            <Modal
                isOpen={isOpen}
                toggle={onClose}
                autoFocus={true}
                backdrop="static"
                size="lg"
                // it has to be above popover which is currently set to 1560
                zIndex={1561}
                container={appNode ?? undefined}
            >
                <div>Create a new discount offer</div>
            </Modal>
        )
    }
