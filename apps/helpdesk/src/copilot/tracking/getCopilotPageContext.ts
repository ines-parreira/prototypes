import { useCallback, useEffect, useRef } from 'react'

import { useLocation } from 'react-router'

import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { Product } from 'routes/layout/productConfig'

import { parseAiAgentSubPath } from '../conversationStarters'

/**
 * App-wide page context attached to every Copilot analytics event. The
 * Copilot is global — it opens from anywhere — so `product`/`productName`
 * (the low-cardinality primary signal) and raw `pathname` (drill-down) are
 * always present. `aiAgentSection` is an AI-Agent-only enrichment, never a
 * primary dimension.
 */
export type CopilotPageContext = {
    product: Product
    productName: string
    pathname: string
    aiAgentSection?: string
}

/**
 * Pure builder — no Router dependency, so it can be unit-tested directly.
 * `aiAgentSection` is only resolved on AI Agent routes and omitted at the
 * AI Agent root (where there is no sub-section).
 */
export function buildCopilotPageContext(
    product: { id: Product; name: string },
    pathname: string,
): CopilotPageContext {
    const context: CopilotPageContext = {
        product: product.id,
        productName: product.name,
        pathname,
    }

    if (product.id === Product.AiAgent) {
        const section = parseAiAgentSubPath(pathname)
        if (section) {
            context.aiAgentSection = section
        }
    }

    return context
}

/**
 * Returns a stable getter `() => CopilotPageContext`. The context is held in
 * a ref so long-lived handlers (e.g. the shortcut effect) always read the
 * current product/pathname without having to re-bind when the route changes.
 */
export function useCopilotPageContext(): () => CopilotPageContext {
    const product = useCurrentRouteProduct()
    const { pathname } = useLocation()

    const contextRef = useRef<CopilotPageContext>(
        buildCopilotPageContext(product, pathname),
    )
    useEffect(() => {
        contextRef.current = buildCopilotPageContext(product, pathname)
    }, [product, pathname])

    return useCallback(() => contextRef.current, [])
}
