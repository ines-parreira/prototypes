import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

import { renderTemplate } from '../utils/renderTemplate'

type TemplateResolver = (template: string) => string

const TemplateResolverContext = createContext<TemplateResolver>(
    (template) => template,
)

type TemplateResolverProviderProps = {
    ticket?: Record<string, unknown>
    customer?: Record<string, unknown>
    currentUser?: {
        name?: string
        firstname?: string
        lastname?: string
        email?: string
    }
    children: ReactNode
}

export function TemplateResolverProvider({
    ticket,
    customer,
    currentUser,
    children,
}: TemplateResolverProviderProps) {
    const context = useMemo(
        () => ({
            ticket: ticket ?? {},
            customer: customer ?? {},
            current_user: currentUser ?? {},
        }),
        [ticket, customer, currentUser],
    )

    const resolve = useCallback(
        (template: string) => renderTemplate(template, context),
        [context],
    )

    return (
        <TemplateResolverContext.Provider value={resolve}>
            {children}
        </TemplateResolverContext.Provider>
    )
}

export function useTemplateResolver() {
    return useContext(TemplateResolverContext)
}
