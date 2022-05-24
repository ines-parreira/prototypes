const TEMPLATE_VARIABLES = ['listIndex', 'integrationId'] as const

type TemplateVariables = typeof TEMPLATE_VARIABLES[number]

export type TemplateValues = Partial<Record<TemplateVariables, string>>

export const renderCustomActionsTemplate = (
    template: string,
    values: TemplateValues
) => {
    let renderedTemplate = template
    for (const [key, value] of Object.entries(values)) {
        renderedTemplate = renderedTemplate.replace(
            new RegExp(`\\$${key}`, 'gm'),
            value
        )
    }
    return renderedTemplate
}
