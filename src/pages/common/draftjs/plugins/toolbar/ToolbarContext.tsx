import React, {ComponentType, createContext, useContext} from 'react'
import _noop from 'lodash/noop'
import {List} from 'immutable'

import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {DiscountCode} from 'models/discountCodes/types'
import {ProductCardDetails, ShopifyIntegration} from 'models/integration/types'
import {DiscountOfferAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'
import {TooltipTourConfigurationType} from './types'

import {ProductCardAttachment} from './components/AddProductLink'

export type ToolbarContextType = {
    // AddLink & AddVideo
    canAddVideoPlayer: boolean
    // AddLink
    onInsertVideoAddedFromInsertLink: () => void
    // AddVideo
    canAddVideoLink: boolean
    onInsertVideoOpen: () => void
    onInsertVideoAdded: () => void
    // AddDiscountCode
    canAddDiscountCodeLink: boolean
    onInsertDiscountCodeOpen: () => void
    onInsertDiscountCodeAdded: (discount: DiscountCode) => void
    canAddUniqueDiscountOffer: boolean
    supportsUniqueDiscountOffer: boolean
    onAddUniqueDiscountOfferAttachment: (
        discount: DiscountOfferAttachment
    ) => void
    // AddProductLink
    canAddProductCard: boolean
    canAddProductLink: boolean
    toolbarTour: Record<string, TooltipTourConfigurationType> | undefined
    disableOutOfStockProducts: boolean
    disableVariantSelection: boolean
    onAddProductCardAttachment: (attachment: ProductCardAttachment) => void
    onInsertProductLinkOpen: () => void
    onInsertProductLinkAdded: (productCardDetails: ProductCardDetails) => void
    shopifyIntegrations: List<any>
    currentShopifyIntegration?: ShopifyIntegration
    // WorkflowVariablePicker
    workflowVariables?: WorkflowVariableList
    workflowVariablesNodeTypes?: NonNullable<
        WorkflowVariableList[number]['nodeType']
    >[]
}

export const ToolbarContext = createContext<ToolbarContextType>({
    canAddVideoPlayer: false,
    onInsertVideoAddedFromInsertLink: _noop,
    canAddVideoLink: false,
    onInsertVideoOpen: _noop,
    onInsertVideoAdded: _noop,
    canAddDiscountCodeLink: false,
    onInsertDiscountCodeOpen: _noop,
    onInsertDiscountCodeAdded: _noop,
    canAddProductCard: false,
    onAddUniqueDiscountOfferAttachment: _noop,
    canAddProductLink: false,
    toolbarTour: undefined,
    disableOutOfStockProducts: false,
    disableVariantSelection: false,
    onAddProductCardAttachment: _noop,
    onInsertProductLinkOpen: _noop,
    onInsertProductLinkAdded: _noop,
    shopifyIntegrations: List([]),
    canAddUniqueDiscountOffer: false,
    supportsUniqueDiscountOffer: false,
})

export const useToolbarContext = () => useContext(ToolbarContext)

export const withToolbarContext = <T extends Partial<ToolbarContextType>>(
    WrappedComponent: ComponentType<T>
) => {
    return (props: Omit<T, keyof ToolbarContextType>) => {
        const toolbarContextProps = useToolbarContext()

        return <WrappedComponent {...toolbarContextProps} {...(props as T)} />
    }
}

export default ToolbarContext
