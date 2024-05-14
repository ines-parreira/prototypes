import {renderTemplate} from 'pages/common/utils/template'
import {TemplateContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

const TEMPLATE_VARIABLES = ['listIndex', 'integrationId', 'appId'] as const

type TemplateVariables = typeof TEMPLATE_VARIABLES[number]

export type TemplateValues = Partial<Record<TemplateVariables, string>>

export function applyCustomActionTemplate(
    template: string,
    templateContext: TemplateContext
) {
    const {variables, context} = templateContext
    const renderedValue = applyCustomActionVariables(template, variables)
    return renderTemplate(renderedValue, context)
}

export function applyCustomActionVariables(
    template: string,
    values: TemplateValues
) {
    let renderedTemplate = template
    for (const [key, value] of Object.entries(values)) {
        renderedTemplate = renderedTemplate.replace(
            new RegExp(`\\$${key}`, 'gm'),
            value
        )
    }
    return renderedTemplate
}
