import React, {ForwardedRef, forwardRef, useMemo} from 'react'
import {fromJS} from 'immutable'

import {logEvent, SegmentEvent} from 'common/segment'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    getNewMessageChannel,
    isNewMessagePublic as getIsNewMessagePublic,
} from 'state/newMessage/selectors'
import {getTicketState} from 'state/ticket/selectors'
import {
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_DISCOUNT_CODES,
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS,
    UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS,
} from 'config/integrations/shopify'
import {TicketChannel} from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    addNewMessageDiscountCode,
    addProductCardAttachment,
} from 'state/newMessage/actions'
import {canAddVideoPlayer} from 'utils'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {SHOPIFY_INTEGRATION_TYPE} from 'constants/integration'
import {getAllCustomerIdsFromTicket} from 'state/ticket/helpers'

import RichField, {Props as RichFieldProps} from './RichField'

type Props = {
    disableOutOfStockProducts?: boolean
    disableProductCards?: boolean
    disableVariantSelection?: boolean
} & RichFieldProps

const getShopifyIntegrations = getIntegrationsByType(IntegrationType.Shopify)

const TicketRichField = (
    {
        disableProductCards,
        disableVariantSelection,
        disableOutOfStockProducts,
        ...props
    }: Props,
    ref: ForwardedRef<RichField>
) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const ticket = useAppSelector(getTicketState)
    const newMessageChannel = useAppSelector(getNewMessageChannel)
    const isNewMessagePublic = useAppSelector(getIsNewMessagePublic)
    const shopifyIntegrations = useAppSelector(getShopifyIntegrations)

    const toolbarContext: ToolbarContextType = useMemo(
        () => ({
            canAddVideoPlayer: canAddVideoPlayer(
                newMessageChannel,
                isNewMessagePublic
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
                    newMessageChannel
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
                    newMessageChannel
                ),
            onInsertDiscountCodeOpen: () => {
                const customerData = getAllCustomerIdsFromTicket(
                    ticket,
                    (integration) =>
                        integration.get('__integration_type__') ===
                        SHOPIFY_INTEGRATION_TYPE
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
                        discount
                    )
                )
            },
            canAddProductCard:
                !disableProductCards &&
                (newMessageChannel === TicketChannel.Chat ||
                    !isNewMessagePublic),
            canAddProductLink:
                !UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_PRODUCT_LINKS.includes(
                    newMessageChannel
                ),
            disableOutOfStockProducts: disableOutOfStockProducts ?? false,
            disableVariantSelection: disableVariantSelection ?? false,
            onAddProductCardAttachment: (attachment) => {
                dispatch(addProductCardAttachment(ticket, attachment))
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
        }),
        [
            disableOutOfStockProducts,
            disableProductCards,
            disableVariantSelection,
            dispatch,
            currentAccount,
            ticket,
            newMessageChannel,
            isNewMessagePublic,
            shopifyIntegrations,
        ]
    )

    return (
        <ToolbarContext.Provider value={toolbarContext}>
            <RichField
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
