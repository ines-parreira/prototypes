import { ComponentProps } from 'react'

import { CardTemplate, LeafTemplate, Source } from 'models/widget/types'
import { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import Field from 'Widgets/modules/Template/modules/Field'

import { TemplateCustomization } from '../types'

export function seekCardCustomization(
    cardExtensionArray: TemplateCustomization['card'] | undefined = [],
    template: CardTemplate,
) {
    const dataPath = (template.absolutePath || []).join('.')
    const templatePath = template.templatePath || ''
    let customization: CardCustomization = {}
    cardExtensionArray.some(
        ({
            dataMatcher,
            templateMatcher,
            customization: matchedExtensions,
        }) => {
            if (
                dataMatcher.test(dataPath) &&
                (templateMatcher ? templateMatcher.test(templatePath) : true)
            ) {
                customization = matchedExtensions
                return true
            }
            return false
        },
    )

    return customization
}

export function seekFieldCustomization(
    fieldExtensionArray: TemplateCustomization['field'] | undefined = [],
    source: Source,
    template: LeafTemplate,
) {
    let customization: Partial<ComponentProps<typeof Field>> = {}
    const dataPath = (template.absolutePath || []).join('.')

    fieldExtensionArray.forEach(
        ({
            type,
            dataMatcher,
            getValue,
            getValueString,
            editionHiddenFields,
            valueCanOverflow,
        }) => {
            let passTypeMatch = true
            let passDataMatch = true
            if (type) {
                passTypeMatch = type === template.type
            }
            if (dataMatcher) {
                passDataMatch = dataMatcher.test(dataPath)
            }

            // Actually pick the customization
            if ((type || dataMatcher) && passTypeMatch && passDataMatch) {
                customization = {
                    value: getValue(source, template),
                    copyableValue: getValueString(source, template),
                    editionHiddenFields,
                    valueCanOverflow,
                }
            }
        },
    )

    return customization
}
