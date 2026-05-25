import type { IconName } from '@gorgias/axiom'

import { ANALYTICS_DEFAULT_PATH } from 'routes/layout/products/analytics'
import { CUSTOMERS_DEFAULT_PATH } from 'routes/layout/products/customers'
import { SETTINGS_DEFAULT_PATH } from 'routes/layout/products/settings'
import { WORKFLOWS_DEFAULT_PATH } from 'routes/layout/products/workflows'

export enum SidebarContentType {
    Default = 'default',
    Sticky = 'sticky',
}

export enum Product {
    Home = 'home',
    Inbox = 'inbox',
    AiAgent = 'aiAgent',
    Marketing = 'marketing',
    Analytics = 'analytics',
    Convert = 'convert',
    Workflows = 'workflows',
    Customers = 'customers',
    Settings = 'settings',
}

export type ProductMetadata = {
    id: Product
    name: string
    productType?: 'primary' | 'secondary'
    sidebarContentType?: SidebarContentType
    urlPatterns: string[]
    icon: IconName
    defaultPath: string
}

export const productMetadata: Record<Product, ProductMetadata> = {
    [Product.Home]: {
        id: Product.Home,
        name: 'Home',
        productType: 'secondary',
        urlPatterns: ['home'],
        icon: 'nav-home',
        defaultPath: '/app/home',
    },
    [Product.Inbox]: {
        id: Product.Inbox,
        name: 'Inbox',
        productType: 'primary',
        urlPatterns: ['tickets', 'ticket', 'views'],
        icon: 'chat-conversation-circle',
        defaultPath: '/app/',
    },
    [Product.AiAgent]: {
        id: Product.AiAgent,
        name: 'AI Agent',
        productType: 'primary',
        urlPatterns: ['ai-agent', 'automation'],
        icon: 'ai-alt-1',
        defaultPath: '/app/ai-agent',
    },
    [Product.Marketing]: {
        id: Product.Marketing,
        name: 'AI Journey',
        productType: 'primary',
        urlPatterns: ['ai-journey'],
        icon: 'send',
        defaultPath: '/app/ai-journey',
    },
    [Product.Analytics]: {
        id: Product.Analytics,
        name: 'Analytics',
        productType: 'primary',
        urlPatterns: ['stats', 'voice-of-customer'],
        icon: 'chart-bar-vertical',
        defaultPath: ANALYTICS_DEFAULT_PATH,
    },
    [Product.Convert]: {
        id: Product.Convert,
        name: 'Convert',
        productType: 'primary',
        urlPatterns: ['convert'],
        icon: 'attach-money',
        defaultPath: '/app/convert/overview',
    },
    [Product.Workflows]: {
        id: Product.Workflows,
        name: 'Workflows',
        productType: 'secondary',
        urlPatterns: ['workflows'],
        icon: 'route',
        defaultPath: WORKFLOWS_DEFAULT_PATH,
    },
    [Product.Customers]: {
        id: Product.Customers,
        name: 'Customers',
        productType: 'secondary',
        urlPatterns: ['customers', 'customer'],
        icon: 'users',
        defaultPath: CUSTOMERS_DEFAULT_PATH,
    },
    [Product.Settings]: {
        id: Product.Settings,
        sidebarContentType: SidebarContentType.Sticky,
        name: 'Settings',
        productType: 'secondary',
        urlPatterns: ['settings'],
        icon: 'settings',
        defaultPath: SETTINGS_DEFAULT_PATH,
    },
}
