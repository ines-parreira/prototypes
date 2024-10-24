import classNames from 'classnames'
import {Map} from 'immutable'
import React, {MouseEvent, useCallback} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {useModalManager} from 'hooks/useModalManager'
import {useGetDiscountOffer} from 'models/convert/discountOffer/queries'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {UNIQUE_DISCOUNT_MODAL_NAME} from 'models/discountCodes/constants'
import {UniqueDiscountOfferCreateModal} from 'pages/common/components/UniqueDiscountOfferCreateModal/UniqueDiscountOfferCreateModal'
import {computeDiscountOfferSummary} from 'pages/common/components/UniqueDiscountOfferResults/utils'
import {DiscountOfferAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'
import {testIds} from 'pages/tickets/detail/components/ReplyArea/DiscountOfferTicketAttachment/utils'
import {getIntegrationById} from 'state/integrations/selectors'

import css from './DiscountOfferTicketAttachment.less'

export type DiscountOfferTicketAttachmentType = {
    supportsEdit: boolean
    discountOffer: DiscountOfferAttachment
    onRemove?: (e: MouseEvent<HTMLElement>) => void
}

// Compute a best matching info from the prop attachment until the asyncOffer and integration
// is available. We do this in order to have `summary` available and have the attachment info
// in sync with the potentially edited offer
const getMeaningfulDiscountOfferInfo = (
    attachment: DiscountOfferAttachment,
    asyncOffer: UniqueDiscountOffer | undefined,
    integration: Map<string, string> | undefined
): {summary: string; name: string; id: string} => {
    if (!asyncOffer) {
        const {
            discount_offer_id,
            discount_offer_code,
            discount_offer_type,
            discount_offer_value,
            summary,
        } = attachment.extra

        const revealSummary =
            discount_offer_type &&
            computeDiscountOfferSummary(
                discount_offer_type,
                discount_offer_value,
                integration
            )

        return {
            id: discount_offer_id,
            summary: revealSummary || summary || discount_offer_code || '',
            name: (revealSummary ? discount_offer_code : '') || attachment.name,
        }
    }

    const summary = computeDiscountOfferSummary(
        asyncOffer.type,
        asyncOffer.value,
        integration
    )
    return {id: asyncOffer.id, name: asyncOffer.prefix, summary}
}

export const DiscountOfferTicketAttachment: React.FC<
    DiscountOfferTicketAttachmentType
> = ({discountOffer, supportsEdit, onRemove}) => {
    const {data: asyncDiscountOffer} = useGetDiscountOffer(
        {
            discount_offer_id: discountOffer.extra.discount_offer_id,
        },
        {
            enabled: !!discountOffer.extra.discount_offer_id && !!supportsEdit,
        }
    )

    const integration = useAppSelector(
        getIntegrationById(Number(asyncDiscountOffer?.store_integration_id))
    )

    const editDiscountModal = useModalManager(UNIQUE_DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const handleCloseModal = useCallback(() => {
        editDiscountModal.closeModal(UNIQUE_DISCOUNT_MODAL_NAME)
    }, [editDiscountModal])

    const handleOpenModal = useCallback(() => {
        editDiscountModal.openModal(
            UNIQUE_DISCOUNT_MODAL_NAME,
            false,
            asyncDiscountOffer
        )
    }, [editDiscountModal, asyncDiscountOffer])

    const {
        id: __id,
        summary,
        name,
    } = getMeaningfulDiscountOfferInfo(
        discountOffer,
        asyncDiscountOffer,
        integration
    )

    const renderRemoveIcon = () => {
        return (
            <i
                data-testid={testIds.removeBtn}
                className={classNames(css.actionItem, 'material-icons')}
                onClick={(e) => onRemove?.(e)}
            >
                close
            </i>
        )
    }

    const renderEditIcon = () => {
        return (
            <i
                data-testid={testIds.editIntentBtn}
                className={classNames(css.actionItem, 'material-icons')}
                onClick={handleOpenModal}
            >
                edit
            </i>
        )
    }

    return (
        <>
            <div className={css.item} data-testid={testIds.wrapper}>
                <div className={css.itemMeta}>
                    <div className={css.metaName}>{name}</div>
                    <div data-testid={testIds.summary}>{summary}</div>
                    {supportsEdit && (
                        <div className={css.actions}>
                            {asyncDiscountOffer && renderEditIcon()}
                            {renderRemoveIcon()}
                        </div>
                    )}
                </div>
            </div>

            {!integration.isEmpty() && (
                <UniqueDiscountOfferCreateModal
                    isOpen={editDiscountModal.isOpen()}
                    integration={integration}
                    onClose={handleCloseModal}
                    onSubmit={handleCloseModal}
                />
            )}
        </>
    )
}
