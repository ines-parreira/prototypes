import React, {ReactNode, useMemo} from 'react'
import _noop from 'lodash/noop'
import {List} from 'immutable'

import ToolbarContext, {ToolbarContextType} from './ToolbarContext'

type Props = {
    children?: ReactNode
} & Partial<ToolbarContextType>

const ToolbarProvider = ({
    children,
    canAddVideoPlayer = false,
    onInsertVideoAddedFromInsertLink = _noop,
    canAddVideoLink = false,
    onInsertVideoOpen = _noop,
    onInsertVideoAdded = _noop,
    canAddDiscountCodeLink = false,
    onInsertDiscountCodeOpen = _noop,
    onInsertDiscountCodeAdded = _noop,
    canAddProductCard = false,
    canAddProductLink = false,
    toolbarTour = {},
    disableOutOfStockProducts = false,
    disableVariantSelection = false,
    onAddProductCardAttachment = _noop,
    onInsertProductLinkOpen = _noop,
    onInsertProductLinkAdded = _noop,
    shopifyIntegrations = List(),
    workflowVariables,
    workflowVariablesNodeTypes,
    canAddUniqueDiscountOffer = false,
    supportsUniqueDiscountOffer = false,
    onAddUniqueDiscountOfferAttachment = _noop,
}: Props) => {
    const toolbarContext: ToolbarContextType = useMemo(
        () => ({
            canAddVideoPlayer,
            onInsertVideoAddedFromInsertLink,
            canAddVideoLink,
            onInsertVideoOpen,
            onInsertVideoAdded,
            canAddDiscountCodeLink,
            onInsertDiscountCodeOpen,
            onInsertDiscountCodeAdded,
            canAddProductCard,
            canAddProductLink,
            toolbarTour,
            disableOutOfStockProducts,
            disableVariantSelection,
            onAddProductCardAttachment,
            onInsertProductLinkOpen,
            onInsertProductLinkAdded,
            shopifyIntegrations,
            workflowVariables,
            workflowVariablesNodeTypes,
            canAddUniqueDiscountOffer,
            supportsUniqueDiscountOffer,
            onAddUniqueDiscountOfferAttachment,
        }),
        [
            canAddVideoPlayer,
            onInsertVideoAddedFromInsertLink,
            canAddVideoLink,
            onInsertVideoOpen,
            onInsertVideoAdded,
            canAddDiscountCodeLink,
            onInsertDiscountCodeOpen,
            onInsertDiscountCodeAdded,
            canAddProductCard,
            canAddProductLink,
            toolbarTour,
            disableOutOfStockProducts,
            disableVariantSelection,
            onAddProductCardAttachment,
            onInsertProductLinkOpen,
            onInsertProductLinkAdded,
            shopifyIntegrations,
            workflowVariables,
            workflowVariablesNodeTypes,
            canAddUniqueDiscountOffer,
            supportsUniqueDiscountOffer,
            onAddUniqueDiscountOfferAttachment,
        ]
    )

    return (
        <ToolbarContext.Provider value={toolbarContext}>
            {children}
        </ToolbarContext.Provider>
    )
}

export default ToolbarProvider
