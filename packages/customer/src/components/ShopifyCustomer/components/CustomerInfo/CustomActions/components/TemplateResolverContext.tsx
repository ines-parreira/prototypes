import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

import { renderTemplate } from '../utils/renderTemplate'

type TemplateResolverOptions = { keepTemplateWhenEmpty?: boolean }

type TemplateResolver = (
    template: string,
    options?: TemplateResolverOptions,
) => string

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
    variables?: Record<string, string | undefined>
    children: ReactNode
}

function applyVariables(
    template: string,
    variables: Record<string, string | undefined>,
): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined) {
            result = result.replace(new RegExp(`\\$${key}`, 'gm'), value)
        }
    }
    return result
}

export function TemplateResolverProvider({
    ticket,
    customer,
    currentUser,
    variables,
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
        (template: string, options?: TemplateResolverOptions) => {
            const substituted = variables
                ? applyVariables(template, variables)
                : template
            return renderTemplate(
                substituted,
                context,
                options?.keepTemplateWhenEmpty,
            )
        },
        [context, variables],
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
