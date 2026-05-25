import type { ComponentType } from 'react'

import type { ProductMetadata } from 'routes/layout/productMetadata'
import { Product, productMetadata } from 'routes/layout/productMetadata'

import {
    AiAgentSidebar,
    AnalyticsSidebar,
    ConvertSidebar,
    CustomersSidebar,
    HomeSidebar,
    InboxSidebar,
    MarketingSidebar,
    SettingsSidebar,
    WorkflowsSidebar,
} from './sidebars'

export { Product, SidebarContentType } from 'routes/layout/productMetadata'

export type ProductConfig = ProductMetadata & {
    sidebar: ComponentType | null
}

const productSidebars: Record<Product, ComponentType | null> = {
    [Product.Home]: HomeSidebar,
    [Product.Inbox]: InboxSidebar,
    [Product.AiAgent]: AiAgentSidebar,
    [Product.Marketing]: MarketingSidebar,
    [Product.Analytics]: AnalyticsSidebar,
    [Product.Convert]: ConvertSidebar,
    [Product.Workflows]: WorkflowsSidebar,
    [Product.Customers]: CustomersSidebar,
    [Product.Settings]: SettingsSidebar,
}

export const productConfig: Record<Product, ProductConfig> = {
    [Product.Home]: {
        ...productMetadata[Product.Home],
        sidebar: productSidebars[Product.Home],
    },
    [Product.Inbox]: {
        ...productMetadata[Product.Inbox],
        sidebar: productSidebars[Product.Inbox],
    },
    [Product.AiAgent]: {
        ...productMetadata[Product.AiAgent],
        sidebar: productSidebars[Product.AiAgent],
    },
    [Product.Marketing]: {
        ...productMetadata[Product.Marketing],
        sidebar: productSidebars[Product.Marketing],
    },
    [Product.Analytics]: {
        ...productMetadata[Product.Analytics],
        sidebar: productSidebars[Product.Analytics],
    },
    [Product.Convert]: {
        ...productMetadata[Product.Convert],
        sidebar: productSidebars[Product.Convert],
    },
    [Product.Workflows]: {
        ...productMetadata[Product.Workflows],
        sidebar: productSidebars[Product.Workflows],
    },
    [Product.Customers]: {
        ...productMetadata[Product.Customers],
        sidebar: productSidebars[Product.Customers],
    },
    [Product.Settings]: {
        ...productMetadata[Product.Settings],
        sidebar: productSidebars[Product.Settings],
    },
}
