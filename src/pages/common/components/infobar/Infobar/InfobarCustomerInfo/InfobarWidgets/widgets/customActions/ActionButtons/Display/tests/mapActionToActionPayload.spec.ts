import {
    ContentType,
    HttpMethod,
} from '../../../../../../../../../../../../models/api/types'
import {actionFixture} from '../../../../../../../../../../../../fixtures/infobarCustomActions'
import {mapActionToActionPayload} from '../mapActionToActionPayload'

describe('mapActionToActionPayload', () => {
    const editableParams = [
        {
            key: 'somekey1',
            value: 'somevalue1',
            label: 'ok1',
            editable: true,
            mandatory: true,
        },
        {
            key: 'somekey2',
            value: 'somevalue2',
            label: 'ok2',
            editable: false,
            mandatory: false,
        },
    ]

    it('should return the expected structure with get requests', () => {
        const action = actionFixture()
        action.headers = editableParams
        action.params = editableParams

        expect(mapActionToActionPayload(action)).toEqual({
            url: action.url,
            method: action.method,
            headers: {
                [action.headers[0].key]: action.headers[0].value,
                [action.headers[1].key]: action.headers[1].value,
            },
            params: {
                [action.params[0].key]: action.params[0].value,
                [action.params[1].key]: action.params[1].value,
            },
            form: {},
            json: {},
        })
    })
    it('should return the expected structure with content type set to form', () => {
        const action = actionFixture()
        action.method = HttpMethod.Post
        action.body.contentType = ContentType.Form
        action.body[ContentType.Form] = editableParams

        expect(mapActionToActionPayload(action)).toEqual({
            url: action.url,
            method: action.method,
            params: {},
            headers: {},
            content_type: action.body.contentType,
            form: {
                [action.body[ContentType.Form][0].key]:
                    action.body[ContentType.Form][0].value,
                [action.body[ContentType.Form][1].key]:
                    action.body[ContentType.Form][1].value,
            },
            json: {},
        })
    })
    it('should return the expected structure with content type set to json', () => {
        const action = actionFixture()
        action.method = HttpMethod.Post
        action.body.contentType = ContentType.Json
        action.body[ContentType.Json] = {
            une_cle: 'unevalue',
            une_autre_cle: 'cestdujson!',
        }

        expect(mapActionToActionPayload(action)).toEqual({
            url: action.url,
            method: action.method,
            params: {},
            headers: {},
            content_type: action.body.contentType,
            form: {},
            json: action.body[ContentType.Json],
        })
    })
})
