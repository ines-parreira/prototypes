import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

export type MetafieldCategory = 'Customer' | 'Order' | 'DraftOrder'

export type NavigationLevel = 'stores' | 'categories' | 'metafields'

export type SubmenuItemProps = {
    label: string
    onClick: (e: React.MouseEvent) => void
    showChevron?: boolean
}

export type ShopifyMetafieldVariablePickerProps = {
    onSelect: (variableValue: string) => void
    onCloseParentMenu?: () => void
}

export type MetafieldsListProps = {
    integrationId: number
    category: MetafieldCategory
    onSelect: (field: Field) => void
}

export type CategoryOption = {
    id: MetafieldCategory
    name: string
}
