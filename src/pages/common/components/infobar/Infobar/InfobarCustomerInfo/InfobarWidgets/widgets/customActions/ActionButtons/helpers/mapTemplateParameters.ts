import {
    Parameter,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {applyCustomActionTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'

export function mapTemplateParameters(
    parameters: Parameter[],
    templateContext: TemplateContext
): Parameter[] {
    return parameters.map(({key, value, label, ...rest}) => ({
        ...rest,
        key: applyCustomActionTemplate(key, templateContext),
        value: applyCustomActionTemplate(value, templateContext),
        label: applyCustomActionTemplate(label, templateContext),
    }))
}
