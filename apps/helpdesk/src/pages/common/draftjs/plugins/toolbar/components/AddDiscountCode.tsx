import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import { ListGroup, ListGroupItem } from 'reactstrap'

import { AttachmentEnum } from 'common/types'
import { useModalManager } from 'hooks/useModalManager'
import type { UniqueDiscountOffer } from 'models/convert/discountOffer/types'
import {
    DELETE_DISCOUNT_MODAL_NAME,
    DISCOUNT_MODAL_NAME,
    UNIQUE_DISCOUNT_MODAL_NAME,
} from 'models/discountCodes/constants'
import type { DiscountCode } from 'models/discountCodes/types'
import {
    discountCodeIsGeneric,
    discountCodeIsUnique,
} from 'models/discountCodes/types'
import { DiscountCodeResultsWrapper } from 'pages/common/components/DiscountCodeResultsWrapper/DiscountCodeResultsWrapper'
import type { DiscountOfferAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'
import { getIconFromType } from 'state/integrations/helpers'
import { insertText } from 'utils'

import { addDiscountCodeLink } from '../../utils'
import { useToolbarContext } from '../ToolbarContext'
import type { ActionInjectedProps } from '../types'
import { ActionName } from '../types'
import { getTooltipTourConfiguration } from '../utils'
import Popover from './ButtonPopover'

import css from './AddDiscountCode.less'

type Props = ActionInjectedProps

const AddDiscountCode = ({
    getEditorState,
    setEditorState,
    isDisabled,
}: Props) => {
    const {
        canAddDiscountCodeLink,
        onInsertDiscountCodeOpen,
        onInsertDiscountCodeAdded,
        shopifyIntegrations,
        toolbarTour,
        onAddUniqueDiscountOfferAttachment,
        currentShopifyIntegration,
    } = useToolbarContext()
    const [isOpen, setOpen] = useState(false)
    const [pickedIntegration, setPickedIntegration] = useState(() => {
        if (shopifyIntegrations.size === 1) {
            return shopifyIntegrations.get(0) as Map<any, any>
        }

        if (!_isEmpty(currentShopifyIntegration)) {
            return fromJS(currentShopifyIntegration) as Map<any, any>
        }

        return null
    })

    const discountModal = useModalManager(DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const handleResetStoreChoice = () => {
        setPickedIntegration(null)
    }

    const handlePopoverOpen = useCallback(() => {
        setOpen(true)

        onInsertDiscountCodeOpen()
    }, [onInsertDiscountCodeOpen])

    // The popover will open some modals for create, edit, delete discount code.
    // There is an issue when submitting changes or clicking outside those modals and popover closes
    // TODO: Fix this behavior of closing the popover without intention
    const handlePopoverClose = useCallback(() => {
        const anyDiscountModalOpen =
            discountModal.isOpen(DISCOUNT_MODAL_NAME) ||
            discountModal.isOpen(UNIQUE_DISCOUNT_MODAL_NAME) ||
            discountModal.isOpen(DELETE_DISCOUNT_MODAL_NAME)

        setOpen(anyDiscountModalOpen)
    }, [discountModal])

    const handlePickIntegration = useCallback((integration: Map<any, any>) => {
        setPickedIntegration(integration)
    }, [])

    const handleAddGenericDiscountCode = useCallback(
        (discount: DiscountCode) => {
            const editorState = getEditorState()

            let newEditorState
            if (discount.shareable_url && canAddDiscountCodeLink) {
                newEditorState = addDiscountCodeLink(
                    editorState,
                    discount.shareable_url,
                    discount.code,
                )
            } else {
                newEditorState = insertText(editorState, discount.code)
            }
            const selection = newEditorState
                .getSelection()
                .merge({ hasFocus: true })
            newEditorState = EditorState.forceSelection(
                newEditorState,
                selection,
            )
            setEditorState(newEditorState)

            onInsertDiscountCodeAdded(discount)
        },
        [
            canAddDiscountCodeLink,
            getEditorState,
            onInsertDiscountCodeAdded,
            setEditorState,
        ],
    )

    const handleAddUniqueDiscountOffer = useCallback(
        (offer: UniqueDiscountOffer) => {
            const offerAttachment: DiscountOfferAttachment = {
                content_type: AttachmentEnum.DiscountOffer,
                name: offer.prefix,
                extra: {
                    discount_offer_id: offer.id,
                    summary: offer.summary,
                },
            }
            onAddUniqueDiscountOfferAttachment(offerAttachment)
        },
        [onAddUniqueDiscountOfferAttachment],
    )

    const handleAddDiscountCode = useCallback(
        (discount: DiscountCode | UniqueDiscountOffer) => {
            if (discountCodeIsGeneric(discount)) {
                handleAddGenericDiscountCode(discount)
            } else if (discountCodeIsUnique(discount)) {
                handleAddUniqueDiscountOffer(discount)
            }
            setOpen(false)
        },
        [handleAddGenericDiscountCode, handleAddUniqueDiscountOffer],
    )

    const tour = useMemo(() => {
        return getTooltipTourConfiguration(
            ActionName.DiscountCodePicker,
            toolbarTour,
        )
    }, [toolbarTour])

    useEffect(() => {
        shortcutManager.bind('AddDiscountCode', {
            CLOSE_POPOVER: {
                key: 'esc',
                action: () => handlePopoverClose(),
            },
        })
        return () => {
            shortcutManager.unbind('AddDiscountCode')
        }
    }, [handlePopoverClose])

    return (
        <Popover
            icon="discount"
            name="Insert Discount Code"
            tour={tour}
            isOpen={isOpen}
            isDisabled={isDisabled}
            onOpen={handlePopoverOpen}
            onClose={handlePopoverClose}
        >
            {!pickedIntegration ? (
                <div className={css.discountLineContainer}>
                    <ListGroup flush>
                        {shopifyIntegrations
                            .toArray()
                            .map(
                                (integration: Map<any, any>, index: number) => (
                                    <ListGroupItem
                                        key={index}
                                        tag="button"
                                        className={css.customListGroup}
                                        action
                                        onClick={(event) => {
                                            event.preventDefault()
                                            handlePickIntegration(integration)
                                        }}
                                    >
                                        <div
                                            className={
                                                css.integrationRowContainer
                                            }
                                        >
                                            <div className={css.integrationRow}>
                                                <img
                                                    className={css.shopifyLogo}
                                                    alt="Logo"
                                                    src={getIconFromType(
                                                        integration.get('type'),
                                                    )}
                                                />
                                                <span>
                                                    {integration.get('name')}
                                                </span>
                                            </div>
                                            <i
                                                className={classnames(
                                                    'material-icons',
                                                    css.arrowIcon,
                                                )}
                                            >
                                                keyboard_arrow_right
                                            </i>
                                        </div>
                                    </ListGroupItem>
                                ),
                            )}
                    </ListGroup>
                </div>
            ) : (
                <DiscountCodeResultsWrapper
                    onDiscountSelected={handleAddDiscountCode}
                    onResetStoreChoice={
                        shopifyIntegrations.size > 1
                            ? handleResetStoreChoice
                            : undefined
                    }
                    integration={pickedIntegration}
                />
            )}
        </Popover>
    )
}

export default AddDiscountCode
