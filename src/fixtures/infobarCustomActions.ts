import {
    Action,
    Parameter,
} from '../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {ContentType, HttpMethod} from '../models/api/types'

export const actionFixture = ({edit = false} = {}): Action => {
    const action: Action = {
        method: HttpMethod.Get,
        url: 'www.someurl.com',
        headers: [],
        params: [],
        body: {
            contentType: ContentType.Json,
            [ContentType.Json]: {},
            [ContentType.Form]: [],
        },
    }
    const editableParameter: Parameter = {
        key: 'someKey',
        value: 'somevalue',
        label: '',
        editable: true,
        mandatory: false,
    }
    if (edit) {
        action.params.push(editableParameter)
    }
    return action
}
