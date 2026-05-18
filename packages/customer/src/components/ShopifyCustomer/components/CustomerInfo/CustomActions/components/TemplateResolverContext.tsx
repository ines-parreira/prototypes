import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

import { renderTemplate } from '../utils/renderTemplate'

type TemplateResolverOptions = { keepTemplateWhenEmpty?: boolean }

type TemplateResolver = (
    template: string,
    options?: TemplateResolverOptions,
) => string

type TemplateResolverInputs = {
    objects: Record<string, unknown>
    variables: Record<string, string | undefined>
}

const EMPTY_OBJECTS: Record<string, unknown> = {
    ticket: {},
    customer: {},
    order: {},
    current_user: {},
}

const TemplateResolverInputsContext =
    createContext<TemplateResolverInputs | null>(null)

type TemplateResolverProviderProps = {
    ticket?: Record<string, unknown>
    customer?: Record<string, unknown>
    order?: Record<string, unknown>
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
    order,
    currentUser,
    variables,
    children,
}: TemplateResolverProviderProps) {
    const parent = useContext(TemplateResolverInputsContext)

    const merged = useMemo<TemplateResolverInputs>(() => {
        const baseObjects = parent?.objects ?? EMPTY_OBJECTS
        const baseVariables = parent?.variables ?? {}
        return {
            objects: {
                ...baseObjects,
                ...(ticket !== undefined && { ticket }),
                ...(customer !== undefined && { customer }),
                ...(order !== undefined && { order }),
                ...(currentUser !== undefined && { current_user: currentUser }),
            },
            variables: { ...baseVariables, ...variables },
        }
    }, [parent, ticket, customer, order, currentUser, variables])

    return (
        <TemplateResolverInputsContext.Provider value={merged}>
            {children}
        </TemplateResolverInputsContext.Provider>
    )
}

export function useTemplateResolver(): TemplateResolver {
    const inputs = useContext(TemplateResolverInputsContext)

    return useCallback(
        (template, options) => {
            if (!inputs) return template
            const substituted = applyVariables(template, inputs.variables)
            return renderTemplate(
                substituted,
                inputs.objects,
                options?.keepTemplateWhenEmpty,
            )
        },
        [inputs],
    )
}
