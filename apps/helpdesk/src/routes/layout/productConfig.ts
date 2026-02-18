import type { ComponentType } from 'react'

import type { IconName } from '@gorgias/axiom'

import { WORKFLOWS_DEFAULT_PATH } from 'routes/layout/products/workflows'

import {
    AiAgentSidebar,
    AnalyticsSidebar,
    CustomersSidebar,
    InboxSidebar,
    MarketingSidebar,
    SettingsSidebar,
    WorkflowsSidebar,
} from './sidebars'

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
    Workflows = 'workflows',
    Customers = 'customers',
    Settings = 'settings',
}

export type ProductConfig = {
    id: Product
    name: string
    description?: string
    sidebarContentType?: SidebarContentType
    sidebar: ComponentType
    urlPatterns: string[]
    icon: IconName
    defaultPath: string
}

export const productConfig: Record<Product, ProductConfig> = {
    [Product.Home]: {
        id: Product.Home,
        name: 'Home',
        sidebar: InboxSidebar,
        urlPatterns: ['home'],
        icon: 'nav-home',
        defaultPath: '/app/home',
    },
    [Product.Inbox]: {
        id: Product.Inbox,
        name: 'Inbox',
        description: 'Talk with customers',
        sidebar: InboxSidebar,
        urlPatterns: ['tickets', 'ticket', 'views'],
        icon: 'comm-chat-conversation-circle',
        defaultPath: '/app/',
    },
    [Product.AiAgent]: {
        id: Product.AiAgent,
        name: 'AI Agent',
        description: 'Automate support and sales',
        sidebar: AiAgentSidebar,
        urlPatterns: ['ai-agent', 'automation'],
        icon: 'ai-alt-1',
        defaultPath: '/app/ai-agent',
    },
    [Product.Marketing]: {
        id: Product.Marketing,
        name: 'Marketing',
        description: 'Send outbound campaigns',
        sidebar: MarketingSidebar,
        urlPatterns: ['ai-journey'],
        icon: 'ai',
        defaultPath: '/app/ai-journey',
    },
    [Product.Analytics]: {
        id: Product.Analytics,
        name: 'Analytics',
        description: 'Gather insights and improve',
        sidebar: AnalyticsSidebar,
        urlPatterns: ['stats', 'voice-of-customer'],
        icon: 'chart-bar-vertical',
        defaultPath: '/app/stats',
    },
    [Product.Workflows]: {
        id: Product.Workflows,
        name: 'Workflows',
        sidebar: WorkflowsSidebar,
        urlPatterns: ['workflows'],
        icon: 'route',
        defaultPath: WORKFLOWS_DEFAULT_PATH,
    },
    [Product.Customers]: {
        id: Product.Customers,
        name: 'Customers',
        sidebar: CustomersSidebar,
        urlPatterns: ['customers', 'customer'],
        icon: 'users',
        defaultPath: '/app/customers',
    },
    [Product.Settings]: {
        id: Product.Settings,
        sidebarContentType: SidebarContentType.Sticky,
        name: 'Settings',
        sidebar: SettingsSidebar,
        urlPatterns: ['settings'],
        icon: 'settings',
        defaultPath: '/app/settings',
    },
}
