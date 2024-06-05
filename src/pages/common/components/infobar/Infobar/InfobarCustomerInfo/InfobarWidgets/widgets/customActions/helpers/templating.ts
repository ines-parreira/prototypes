import {renderTemplate} from 'pages/common/utils/template'
import {TemplateContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

const TEMPLATE_VARIABLES = ['listIndex', 'integrationId', 'appId'] as const

type TemplateVariables = typeof TEMPLATE_VARIABLES[number]

export type TemplateValues = Partial<Record<TemplateVariables, string>>

export function applyCustomActionTemplate(
    template: string | undefined,
    templateContext: TemplateContext,
    keepTemplateWhenEmpty?: boolean
) {
    const {variables, context} = templateContext
    const firstPassValue = applyCustomActionVariables(template, variables)
    const templatedValue = renderTemplate(
        firstPassValue,
        context,
        keepTemplateWhenEmpty
    )

    return templatedValue
}

export function applyCustomActionVariables(
    template: string | undefined,
    values: TemplateValues
) {
    let renderedTemplate = template || ''
    for (const [key, value] of Object.entries(values)) {
        renderedTemplate = renderedTemplate.replace(
            new RegExp(`\\$${key}`, 'gm'),
            value
        )
    }
    return renderedTemplate
}
