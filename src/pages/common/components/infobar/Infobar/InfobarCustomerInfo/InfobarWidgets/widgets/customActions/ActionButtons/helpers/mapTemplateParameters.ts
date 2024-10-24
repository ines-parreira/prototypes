import {applyCustomActionTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
import {
    Parameter,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export function mapTemplateParameters(
    parameters: Parameter[],
    templateContext: TemplateContext,
    keepTemplateWhenEmpty?: boolean
): Parameter[] {
    return parameters.map(({key, value, label, ...rest}) => ({
        ...rest,
        key: applyCustomActionTemplate(
            key,
            templateContext,
            keepTemplateWhenEmpty
        ),
        value: applyCustomActionTemplate(
            value,
            templateContext,
            keepTemplateWhenEmpty
        ),
        label: applyCustomActionTemplate(
            label,
            templateContext,
            keepTemplateWhenEmpty
        ),
    }))
}
