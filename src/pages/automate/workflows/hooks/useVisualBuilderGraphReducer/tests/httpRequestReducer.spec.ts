import {visualBuilderGraphLlmPromptTriggerFixture} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import {httpRequestReducer} from '../httpRequestReducer'

describe('httpRequestReducer', () => {
    test('SET_HTTP_REQUEST_METHOD', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        let nextG = httpRequestReducer(g, {
            type: 'SET_HTTP_REQUEST_METHOD',
            httpRequestNodeId: 'http_request1',
            method: 'POST',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    method: 'POST',
                    bodyContentType: 'application/json',
                    json: '{}',
                    formUrlencoded: null,
                }),
            })
        )

        nextG = httpRequestReducer(nextG, {
            type: 'SET_HTTP_REQUEST_METHOD',
            httpRequestNodeId: 'http_request1',
            method: 'GET',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    method: 'GET',
                    bodyContentType: null,
                    json: null,
                    formUrlencoded: null,
                }),
            })
        )
    })

    test('SET_HTTP_REQUEST_BODY_CONTENT_TYPE', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        let nextG = httpRequestReducer(g, {
            type: 'SET_HTTP_REQUEST_METHOD',
            httpRequestNodeId: 'http_request1',
            method: 'POST',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    method: 'POST',
                    bodyContentType: 'application/json',
                    json: '{}',
                    formUrlencoded: null,
                }),
            })
        )

        nextG = httpRequestReducer(nextG, {
            type: 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE',
            httpRequestNodeId: 'http_request1',
            bodyContentType: 'application/x-www-form-urlencoded',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    method: 'POST',
                    bodyContentType: 'application/x-www-form-urlencoded',
                    json: null,
                    formUrlencoded: [],
                }),
            })
        )

        nextG = httpRequestReducer(nextG, {
            type: 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE',
            httpRequestNodeId: 'http_request1',
            bodyContentType: 'application/json',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    method: 'POST',
                    bodyContentType: 'application/json',
                    json: '{}',
                    formUrlencoded: null,
                }),
            })
        )
    })
})
