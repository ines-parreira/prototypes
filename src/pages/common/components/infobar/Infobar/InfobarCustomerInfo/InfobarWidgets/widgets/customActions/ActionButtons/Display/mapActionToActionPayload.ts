import {
    ContentType,
    HttpMethod,
} from '../../../../../../../../../../../models/api/types'
import {Action, ActionPayload, Parameter, PayloadParameters} from '../../types'

const mapParametersToPayloadParameters = (
    parameters: Parameter[]
): PayloadParameters => {
    const payloadParameters: PayloadParameters = {}
    parameters.forEach(({key, value}) => {
        payloadParameters[key] = value
    })
    return payloadParameters
}

export const mapActionToActionPayload = ({
    method,
    url,
    params,
    headers,
    body,
}: Action): ActionPayload => {
    const payload: ActionPayload = {
        method,
        url,
        params: {},
        headers: {},
        form: {},
        json: {},
    }
    payload.params = mapParametersToPayloadParameters(params)
    payload.headers = mapParametersToPayloadParameters(headers)
    if (method !== HttpMethod.Get) {
        payload.content_type = body.contentType
        if (body.contentType === ContentType.Form) {
            payload.form = mapParametersToPayloadParameters(
                body[ContentType.Form]
            )
        } else {
            payload.json = body[ContentType.Json]
        }
    }
    return payload
}
