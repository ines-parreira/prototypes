import { visualBuilderGraphLlmPromptTriggerFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { httpRequestReducer } from '../httpRequestReducer'

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
            }),
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
            }),
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
            }),
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
            }),
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
            }),
        )
    })
    test('TOGGLE_OAUTH2_SETTINGS', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        // Enable oauth2 token
        const nextG = httpRequestReducer(g, {
            type: 'TOGGLE_OAUTH2_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    oauth2TokenSettings: g.apps?.[0].type === 'app' && {
                        account_oauth2_token_id: `{{apps.${g.apps?.[0]?.app_id}.account_oauth2_token_id}}`,
                        refresh_token_url: `{{apps.${g.apps?.[0]?.app_id}.refresh_token_url}}`,
                    },
                }),
            }),
        )
        // Disable oauth2 token
        const nextG2 = httpRequestReducer(nextG, {
            type: 'TOGGLE_OAUTH2_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG2.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    oauth2TokenSettings: null,
                }),
            }),
        )
    })
    test('TOGGLE_TRACKSTAR_AUTH_SETTINGS', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        // Enable trackstar integration
        const nextG = httpRequestReducer(g, {
            type: 'TOGGLE_TRACKSTAR_AUTH_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    trackstar_integration_name:
                        g.apps?.[0].type === 'app' &&
                        `{{apps.${g.apps?.[0]?.app_id}.trackstar_integration_name}}`,
                }),
            }),
        )

        // Disable trackstar integration
        const nextG2 = httpRequestReducer(nextG, {
            type: 'TOGGLE_TRACKSTAR_AUTH_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG2.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    trackstar_integration_name: null,
                }),
            }),
        )
    })

    test('TOGGLE_SERVICE_CONNECTION_SETTINGS enables for shopify app', () => {
        const g = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            apps: [{ type: 'shopify' as const }],
        }

        const nextG = httpRequestReducer(g, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '',
                    },
                }),
            }),
        )
    })

    test('TOGGLE_SERVICE_CONNECTION_SETTINGS enables for recharge app', () => {
        const g = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            apps: [{ type: 'recharge' as const }],
        }

        const nextG = httpRequestReducer(g, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    serviceConnectionSettings: {
                        integration_id: '{{apps.recharge.integration_id}}',
                        path: '',
                    },
                }),
            }),
        )
    })

    test('TOGGLE_SERVICE_CONNECTION_SETTINGS disables when already enabled', () => {
        const g = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            apps: [{ type: 'shopify' as const }],
        }

        let nextG = httpRequestReducer(g, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        nextG = httpRequestReducer(nextG, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    serviceConnectionSettings: null,
                }),
            }),
        )
    })

    test('TOGGLE_SERVICE_CONNECTION_SETTINGS does nothing for non-native app', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture

        const nextG = httpRequestReducer(g, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        const node = nextG.nodes.find((n) => n.type === 'http_request')
        expect(node).toBeDefined()
        if (node && node.type === 'http_request') {
            expect(node.data.serviceConnectionSettings).toBeUndefined()
        }
    })

    test('SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH', () => {
        const g = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            apps: [{ type: 'shopify' as const }],
        }

        let nextG = httpRequestReducer(g, {
            type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS',
            httpRequestNodeId: 'http_request1',
        })

        nextG = httpRequestReducer(nextG, {
            type: 'SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH',
            httpRequestNodeId: 'http_request1',
            path: '/admin/api/2025-01/orders.json',
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    serviceConnectionSettings: {
                        integration_id: '{{store.helpdesk_integration_id}}',
                        path: '/admin/api/2025-01/orders.json',
                    },
                }),
            }),
        )
    })

    test('SET_HTTP_REQUEST_TEST_REQUEST_INPUTS', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture
        const testInputs = {
            variable1: 'test value 1',
            variable2: 'test value 2',
        }
        const refreshToken = 'test-refresh-token'

        const nextG = httpRequestReducer(g, {
            type: 'SET_HTTP_REQUEST_TEST_REQUEST_INPUTS',
            httpRequestNodeId: 'http_request1',
            inputs: testInputs,
            refreshToken: refreshToken,
        })

        expect(nextG.nodes.find((n) => n.type === 'http_request')).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    testRequestInputs: testInputs,
                    testRequestRefreshToken: refreshToken,
                }),
            }),
        )
    })

    test('RESET_HTTP_REQUEST_TEST_REQUEST_RESULT should only clear result, not inputs', () => {
        const g = visualBuilderGraphLlmPromptTriggerFixture

        // First set some test inputs and result
        let nextG = httpRequestReducer(g, {
            type: 'SET_HTTP_REQUEST_TEST_REQUEST_INPUTS',
            httpRequestNodeId: 'http_request1',
            inputs: { var1: 'value1' },
            refreshToken: 'token',
        })

        nextG = httpRequestReducer(nextG, {
            type: 'SET_HTTP_REQUEST_TEST_REQUEST_RESULT',
            httpRequestNodeId: 'http_request1',
            result: { status: 200, content: 'ok' },
        })

        // Now reset
        nextG = httpRequestReducer(nextG, {
            type: 'RESET_HTTP_REQUEST_TEST_REQUEST_RESULT',
            httpRequestNodeId: 'http_request1',
        })

        const node = nextG.nodes.find((n) => n.type === 'http_request')
        expect(node).toBeDefined()
        if (node && node.type === 'http_request') {
            expect(node.data.testRequestResult).toBeUndefined()
            // Inputs should be preserved
            expect(node.data.testRequestInputs).toEqual({ var1: 'value1' })
            expect(node.data.testRequestRefreshToken).toBe('token')
        }
    })
})
