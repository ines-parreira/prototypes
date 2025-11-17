import type { ReactNode } from 'react'
import React, { useMemo } from 'react'

import { List } from 'immutable'
import _noop from 'lodash/noop'

import type { ToolbarContextType } from './ToolbarContext'
import { ToolbarContext } from './ToolbarContext'

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
    canAddProductAutomations = false,
    canAddUtm = false,
    toolbarTour = {},
    disableOutOfStockProducts = false,
    disableVariantSelection = false,
    onAddProductCardAttachment = _noop,
    onAddProductAutomationAttachment = _noop,
    onInsertProductLinkOpen = _noop,
    onInsertProductLinkAdded = _noop,
    shopifyIntegrations = List(),
    workflowVariables,
    workflowVariablesDataTypes,
    guidanceVariables,
    guidanceActions,
    canAddUniqueDiscountOffer = false,
    supportsUniqueDiscountOffer = false,
    onAddUniqueDiscountOfferAttachment = _noop,
    placementType = undefined,
    shopName,
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
            canAddProductAutomations,
            canAddUtm,
            toolbarTour,
            disableOutOfStockProducts,
            disableVariantSelection,
            onAddProductCardAttachment,
            onAddProductAutomationAttachment,
            onInsertProductLinkOpen,
            onInsertProductLinkAdded,
            shopifyIntegrations,
            workflowVariables,
            workflowVariablesDataTypes,
            guidanceVariables,
            guidanceActions,
            canAddUniqueDiscountOffer,
            supportsUniqueDiscountOffer,
            onAddUniqueDiscountOfferAttachment,
            placementType,
            shopName,
        }),
        [
            canAddVideoPlayer,
            onInsertVideoAddedFromInsertLink,
            canAddVideoLink,
            onInsertVideoOpen,
            onInsertVideoAdded,
            canAddDiscountCodeLink,
            guidanceVariables,
            onInsertDiscountCodeOpen,
            onInsertDiscountCodeAdded,
            canAddProductCard,
            canAddProductLink,
            canAddProductAutomations,
            canAddUtm,
            toolbarTour,
            disableOutOfStockProducts,
            disableVariantSelection,
            onAddProductCardAttachment,
            onAddProductAutomationAttachment,
            onInsertProductLinkOpen,
            onInsertProductLinkAdded,
            shopifyIntegrations,
            workflowVariables,
            workflowVariablesDataTypes,
            guidanceActions,
            canAddUniqueDiscountOffer,
            supportsUniqueDiscountOffer,
            onAddUniqueDiscountOfferAttachment,
            placementType,
            shopName,
        ],
    )

    return (
        <ToolbarContext.Provider value={toolbarContext}>
            {children}
        </ToolbarContext.Provider>
    )
}

export default ToolbarProvider
