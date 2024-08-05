import {Template} from 'models/widget/types'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import {TemplateCustomization} from '../types'

export function seekCardCustomization(
    cardExtensionArray: TemplateCustomization['card'],
    template: Template
) {
    const dataPath = (template.absolutePath || []).join('.')
    const templatePath = template.templatePath || ''
    let customization: CardCustomization = {}
    if (cardExtensionArray) {
        cardExtensionArray.some(
            ({
                dataMatcher,
                templateMatcher,
                customization: matchedExtensions,
            }) => {
                if (
                    dataMatcher.test(dataPath) &&
                    (templateMatcher
                        ? templateMatcher.test(templatePath)
                        : true)
                ) {
                    customization = matchedExtensions
                    return true
                }
                return false
            }
        )
    }
    return customization
}
