import {List} from 'immutable'
import _noop from 'lodash/noop'
import React, {ComponentType, createContext, useContext} from 'react'

import {DiscountCode} from 'models/discountCodes/types'
import {ProductCardDetails, ShopifyIntegration} from 'models/integration/types'
import {
    WorkflowVariableList,
    WorkflowVariableType,
} from 'pages/automate/workflows/models/variables.types'
import {RichFieldEditorPlacement} from 'pages/common/forms/RichField/enums'
import {
    AttachmentType,
    DiscountOfferAttachment,
} from 'pages/convert/campaigns/types/CampaignAttachment'

import {ProductCardAttachment} from './components/AddProductLink'
import {TooltipTourConfigurationType} from './types'

export type ToolbarContextType = {
    placementType: RichFieldEditorPlacement | undefined
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
    canAddProductAutomations: boolean
    canAddUtm: boolean
    toolbarTour: Record<string, TooltipTourConfigurationType> | undefined
    disableOutOfStockProducts: boolean
    disableVariantSelection: boolean
    onAddProductCardAttachment: (attachment: ProductCardAttachment) => void
    onAddProductAutomationAttachment: (attachment: AttachmentType) => void
    onInsertProductLinkOpen: () => void
    onInsertProductLinkAdded: (productCardDetails: ProductCardDetails) => void
    shopifyIntegrations: List<any>
    currentShopifyIntegration?: ShopifyIntegration
    // WorkflowVariablePicker
    workflowVariables?: WorkflowVariableList
    workflowVariablesDataTypes?: WorkflowVariableType[]
    onContactFormOpenChange?: (value: boolean) => void
    contactFormButtonEnabled?: boolean
}

export const ToolbarContext = createContext<ToolbarContextType>({
    placementType: undefined,
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
    canAddProductAutomations: false,
    canAddUtm: false,
    toolbarTour: undefined,
    disableOutOfStockProducts: false,
    disableVariantSelection: false,
    onAddProductCardAttachment: _noop,
    onAddProductAutomationAttachment: _noop,
    onInsertProductLinkOpen: _noop,
    onInsertProductLinkAdded: _noop,
    shopifyIntegrations: List([]),
    canAddUniqueDiscountOffer: false,
    supportsUniqueDiscountOffer: false,
    onContactFormOpenChange: _noop,
    contactFormButtonEnabled: true,
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
