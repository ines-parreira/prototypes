import { ForwardedRef, forwardRef, useEffect, useMemo, useState } from 'react'

import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import {
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_DISCOUNT_CODES,
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS,
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS,
} from 'config/integrations/shopify'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { ShopifyIntegration } from 'models/integration/types'
import {
    ToolbarContext,
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import { TooltipTourConfigurationType } from 'pages/common/draftjs/plugins/toolbar/types'
import { RichFieldEditorPlacement } from 'pages/common/forms/RichField/enums'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import {
    addAttachment,
    addNewMessageDiscountCode,
} from 'state/newMessage/actions'
import {
    isNewMessagePublic as getIsNewMessagePublic,
    getNewMessageChannel,
} from 'state/newMessage/selectors'
import { getAllCustomerIdsFromTicket } from 'state/ticket/helpers'
import { getTicketState } from 'state/ticket/selectors'
import { canAddVideoPlayer } from 'utils'

import RichField, { Props as RichFieldProps } from './RichField'

type Props = {
    disableOutOfStockProducts?: boolean
    disableProductCards?: boolean
    disableVariantSelection?: boolean
    toolbarTour?: Record<string, TooltipTourConfigurationType>
    supportsUniqueDiscountOffer?: boolean
    canAddUniqueDiscountOffer?: boolean
    canAddProductAutomations?: boolean
    canAddUtm?: boolean
    sortAttachments?: boolean
    currentShopifyIntegration?: ShopifyIntegration
    placementType?: RichFieldEditorPlacement
    onContactFormOpenChange?: (value: boolean) => void
    contactFormButtonEnabled?: boolean
} & RichFieldProps

const getShopifyIntegrations = getIntegrationsByType(IntegrationType.Shopify)

const TicketRichField = (
    {
        disableProductCards,
        disableVariantSelection,
        disableOutOfStockProducts,
        supportsUniqueDiscountOffer = false,
        canAddUniqueDiscountOffer = false,
        canAddProductAutomations = false,
        canAddUtm = false,
        sortAttachments = false,
        toolbarTour,
        currentShopifyIntegration,
        placementType = undefined,
        onContactFormOpenChange,
        contactFormButtonEnabled,
        ...props
    }: Props,
    ref: ForwardedRef<RichField>,
) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const ticket = useAppSelector(getTicketState)
    const newMessageChannel = useAppSelector(getNewMessageChannel)
    const isNewMessagePublic = useAppSelector(getIsNewMessagePublic)
    const shopifyIntegrations = useAppSelector(getShopifyIntegrations)
    const [key, setKey] = useState<string>(`rich-field-content-${Date.now()}`)

    /**
     * Post React 18 migration, we need to set a key to the RichField component
     * to force a re-render when the value is cleared/reset.
     * We only update the key when the content becomes empty (cleared).
     */
    useEffect(() => {
        // Check if content is empty without assuming it's a string
        const hasHtmlContent =
            props.value.html &&
            (typeof props.value.html === 'string'
                ? props.value.html.trim() !== ''
                : true)
        const hasTextContent =
            props.value.text &&
            (typeof props.value.text === 'string'
                ? props.value.text.trim() !== ''
                : true)

        const isEmpty = !hasHtmlContent && !hasTextContent

        if (isEmpty) {
            // Generate a unique key when content is cleared
            setKey(`rich-field-content-${Date.now()}`)
        }
    }, [props.value.html, props.value.text])

    const toolbarContext: ToolbarContextType = useMemo(
        () => ({
            placementType: placementType,
            canAddVideoPlayer: canAddVideoPlayer(
                newMessageChannel,
                isNewMessagePublic,
            ),
            onInsertVideoAddedFromInsertLink: () => {
                logEvent(SegmentEvent.InsertVideoAddedFromInsertLink, {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    ticket: ticket?.get('id') || 'new',
                })
            },
            canAddVideoLink:
                !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS.includes(
                    newMessageChannel,
                ),
            onInsertVideoOpen: () => {
                logEvent(SegmentEvent.InsertVideoOpen, {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    ticket: ticket?.get('id') || 'new',
                })
            },
            onInsertVideoAdded: () => {
                logEvent(SegmentEvent.InsertVideoAdded, {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    ticket: ticket?.get('id') || 'new',
                })
            },
            canAddDiscountCodeLink:
                !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_DISCOUNT_CODES.includes(
                    newMessageChannel,
                ),
            canAddUtm: canAddUtm,
            supportsUniqueDiscountOffer,
            canAddUniqueDiscountOffer,
            onInsertDiscountCodeOpen: () => {
                const customerData = getAllCustomerIdsFromTicket(
                    ticket,
                    (integration) =>
                        integration.get('__integration_type__') ===
                        SHOPIFY_INTEGRATION_TYPE,
                )

                logEvent(SegmentEvent.InsertDiscountCodeOpen, {
                    account_domain: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    ticket: ticket?.get('id') || 'new',
                    customer: customerData,
                })
            },
            onInsertDiscountCodeAdded: (discount) => {
                dispatch(
                    addNewMessageDiscountCode(
                        ticket?.get('id') || 'new',
                        discount,
                    ),
                )
            },
            canAddProductCard:
                !disableProductCards &&
                (newMessageChannel === TicketChannel.Chat ||
                    !isNewMessagePublic),
            canAddProductLink:
                !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS.includes(
                    newMessageChannel,
                ),
            canAddProductAutomations,
            toolbarTour: toolbarTour ?? {},
            disableOutOfStockProducts: disableOutOfStockProducts ?? false,
            disableVariantSelection: disableVariantSelection ?? false,
            onAddProductCardAttachment: (attachment) => {
                dispatch(addAttachment(ticket, attachment, sortAttachments))
            },
            onAddUniqueDiscountOfferAttachment: (discount) => {
                dispatch(addAttachment(ticket, discount, sortAttachments))

                logEvent(SegmentEvent.InsertUniqueDiscountCodeAdded, {
                    account_domain: currentAccount?.get('domain'),
                })
            },
            onAddProductAutomationAttachment: (attachment) => {
                dispatch(addAttachment(ticket, attachment, sortAttachments))
            },
            onInsertProductLinkOpen: () => {
                logEvent(SegmentEvent.ShopifyInsertProductLinkOpen, {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    ticket: ticket?.get('id') || 'new',
                })
            },
            onInsertProductLinkAdded: (productCardDetails) => {
                logEvent(SegmentEvent.ShopifyInsertProductLinkAdded, {
                    account_id: currentAccount?.get('domain'),
                    channel: newMessageChannel,
                    product_id: productCardDetails.productId,
                    variant_id: productCardDetails.variantId,
                    ticket: ticket?.get('id') || 'new',
                })
            },
            shopifyIntegrations: fromJS(shopifyIntegrations),
            currentShopifyIntegration: currentShopifyIntegration,
            onContactFormOpenChange: onContactFormOpenChange,
            contactFormButtonEnabled: contactFormButtonEnabled,
        }),
        [
            disableOutOfStockProducts,
            disableProductCards,
            disableVariantSelection,
            toolbarTour,
            dispatch,
            currentAccount,
            ticket,
            newMessageChannel,
            isNewMessagePublic,
            shopifyIntegrations,
            currentShopifyIntegration,
            supportsUniqueDiscountOffer,
            canAddUniqueDiscountOffer,
            canAddProductAutomations,
            canAddUtm,
            sortAttachments,
            placementType,
            onContactFormOpenChange,
            contactFormButtonEnabled,
        ],
    )

    return (
        <ToolbarContext.Provider value={toolbarContext}>
            <RichField
                key={key}
                ref={ref}
                canAddVideoPlayer={toolbarContext.canAddVideoPlayer}
                onInsertVideoAddedFromPastedLink={() => {
                    logEvent(SegmentEvent.InsertVideoAddedFromPastedLink, {
                        account_id: currentAccount?.get('domain'),
                        channel: newMessageChannel,
                        ticket: ticket?.get('id') || 'new',
                    })
                }}
                {...props}
            />
        </ToolbarContext.Provider>
    )
}

export default forwardRef<RichField, Props>(TicketRichField)
