import type { Literal } from 'estree'
import type { Iterable, List } from 'immutable'

import type { ShopifyIntegration } from 'models/integration/types'
import type { IdentifierCategoryKey } from 'models/rule/types'
import type { RuleItemActions } from 'pages/settings/rules/types'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'
import type { SupportedCategories } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/types'

export type SyntaxTreeLeaves = Iterable<number, Literal['value']> | null

export type MetafieldLevel = 'stores' | 'metafields'

export interface UseMetafieldRuleSelectionParams {
    syntaxTreeLeaves: SyntaxTreeLeaves
    actions: RuleItemActions
    parent: List<any>
    shopifyIntegrations: ShopifyIntegration[]
}

export interface UseMetafieldRuleSelectionReturn {
    hasMetafieldInTree: boolean
    showMetafieldSelection: SupportedCategories | null
    selectedMetafield: Field | null
    selectedStore: ShopifyIntegration | null
    metafieldLevel: MetafieldLevel
    metafields: Field[]
    isLoadingMetafields: boolean
    displayStoreName: string | null
    selectMetafield: (field: Field, category: SupportedCategories) => void
    setSelectedStore: (store: ShopifyIntegration | null) => void
    setMetafieldLevel: (level: MetafieldLevel) => void
    resetMetafieldSelection: () => void
}

export interface MetafieldCategoryOptionsProps {
    selectedCategory: IdentifierCategoryKey
    shopifyIntegrations: ShopifyIntegration[]
    selectedStore: ShopifyIntegration | null
    metafieldLevel: MetafieldLevel
    metafields: Field[]
    isLoadingMetafields: boolean
    onSelectStore: (store: ShopifyIntegration) => void
    onBackToStores: () => void
    onSelectMetafield: (field: Field, category: SupportedCategories) => void
}

export interface MetafieldValueLabelProps {
    selectedMetafield: Field
    displayStoreName: string | null
}
