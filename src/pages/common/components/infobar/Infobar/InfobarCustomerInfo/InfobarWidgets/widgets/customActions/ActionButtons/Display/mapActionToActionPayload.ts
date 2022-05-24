import {ContentType, HttpMethod} from 'models/api/types'
import {
    renderCustomActionsTemplate,
    TemplateValues,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/templating'
import {
    Action,
    ActionPayload,
    Parameter,
    PayloadParameters,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

const mapParametersToPayloadParameters = (
    parameters: Parameter[],
    templateValues: TemplateValues
): PayloadParameters => {
    const payloadParameters: PayloadParameters = {}
    parameters.forEach(({key, value}) => {
        payloadParameters[renderCustomActionsTemplate(key, templateValues)] =
            renderCustomActionsTemplate(value, templateValues)
    })
    return payloadParameters
}

export const mapActionToActionPayload = (
    {method, url, params, headers, body}: Action,
    templateValues: TemplateValues
): ActionPayload => {
    const payload: ActionPayload = {
        method,
        url: renderCustomActionsTemplate(url, templateValues),
        params: {},
        headers: {},
        form: {},
        json: {},
    }
    payload.params = mapParametersToPayloadParameters(params, templateValues)
    payload.headers = mapParametersToPayloadParameters(headers, templateValues)
    if (method !== HttpMethod.Get) {
        payload.content_type = body.contentType
        if (body.contentType === ContentType.Form) {
            payload.form = mapParametersToPayloadParameters(
                body[ContentType.Form],
                templateValues
            )
        } else {
            payload.json = JSON.parse(
                renderCustomActionsTemplate(
                    JSON.stringify(body[ContentType.Json]),
                    templateValues
                )
            )
        }
    }
    return payload
}
