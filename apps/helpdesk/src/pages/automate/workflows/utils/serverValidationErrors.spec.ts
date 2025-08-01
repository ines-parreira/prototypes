import { AxiosError } from 'axios'

import { VisualBuilderGraph } from '../models/visualBuilderGraph.types'
import {
    extractServerErrorMessages,
    mapServerErrorsToGraph,
    parseStepError,
} from './serverValidationErrors'

describe('serverValidationErrors', () => {
    describe('parseStepError', () => {
        it('should parse liquid template error correctly', () => {
            const errorMessage =
                'steps.1.settings.template: output "{{age}}" not closed, line:5, col:1'
            const result = parseStepError(errorMessage)

            expect(result).toEqual({
                stepIndex: 1,
                field: 'template',
                errorMessage: 'output "{{age}}" not closed, line:5, col:1',
            })
        })

        it('should parse HTTP request URL error correctly', () => {
            const errorMessage = 'steps.0.settings.url: Invalid URL format'
            const result = parseStepError(errorMessage)

            expect(result).toEqual({
                stepIndex: 0,
                field: 'url',
                errorMessage: 'Invalid URL format',
            })
        })

        it('should return null for invalid error format', () => {
            const errorMessage = 'Invalid error message format'
            const result = parseStepError(errorMessage)

            expect(result).toBeNull()
        })

        it('should handle complex error messages with colons', () => {
            const errorMessage =
                'steps.2.settings.json: JSON parse error: Unexpected token at line:3, col:15'
            const result = parseStepError(errorMessage)

            expect(result).toEqual({
                stepIndex: 2,
                field: 'json',
                errorMessage:
                    'JSON parse error: Unexpected token at line:3, col:15',
            })
        })
    })

    describe('mapServerErrorsToGraph', () => {
        const mockGraph: VisualBuilderGraph = {
            id: 'test-graph',
            internal_id: 'test-internal',
            is_draft: true,
            name: 'Test Graph',
            available_languages: ['en-US'],
            nodes: [
                {
                    id: 'trigger-1',
                    type: 'channel_trigger',
                    position: { x: 0, y: 0 },
                    data: { errors: null },
                } as any,
                {
                    id: 'liquid-1',
                    type: 'liquid_template',
                    position: { x: 0, y: 100 },
                    data: {
                        name: 'Test Template',
                        template: '{{age}}',
                        errors: null,
                    },
                } as any,
                {
                    id: 'http-1',
                    type: 'http_request',
                    position: { x: 0, y: 200 },
                    data: {
                        name: 'Test Request',
                        url: 'invalid-url',
                        errors: null,
                    },
                } as any,
                {
                    id: 'http-2',
                    type: 'http_request',
                    position: { x: 0, y: 300 },
                    data: {
                        name: 'Test Request 2',
                        url: 'another-invalid-url',
                        errors: null,
                    },
                } as any,
            ],
            edges: [],
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate: false,
        }

        it('should map liquid template error to correct node', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.1.settings.template: output "{{age}}" not closed, line:5, col:1',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = mapServerErrorsToGraph(serverError, mockGraph)

            expect(result).toBeTruthy()
            expect(result!.nodes[2].data.errors).toEqual({
                template: 'output "{{age}}" not closed, line:5, col:1',
            })
        })

        it('should handle multiple errors on different steps', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.1.settings.template: Invalid liquid syntax',
                            'steps.2.settings.url: Invalid URL format',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = mapServerErrorsToGraph(serverError, mockGraph)

            expect(result).toBeTruthy()
            expect(result!.nodes[2].data.errors).toEqual({
                template: 'Invalid liquid syntax',
            })
            expect(result!.nodes[3].data.errors).toEqual({
                url: 'Invalid URL format',
            })
        })

        it('should return null for non-validation errors', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Network Error',
                response: {
                    status: 500,
                    data: { message: 'Internal Server Error' },
                    statusText: 'Internal Server Error',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = mapServerErrorsToGraph(serverError, mockGraph)

            expect(result).toBeNull()
        })

        it('should return null for invalid error objects', () => {
            const invalidError = new Error('Regular error')

            const result = mapServerErrorsToGraph(invalidError, mockGraph)

            expect(result).toBeNull()
        })

        it('should return null when no parseable errors are found', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'Invalid error format without proper step pattern',
                            'Another unparseable error message',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = mapServerErrorsToGraph(serverError, mockGraph)

            expect(result).toBeNull()
        })

        it('should handle non-object errors', () => {
            const primitiveError = 'string error'

            const result = mapServerErrorsToGraph(primitiveError, mockGraph)

            expect(result).toBeNull()
        })

        it('should handle null/undefined errors', () => {
            expect(mapServerErrorsToGraph(null, mockGraph)).toBeNull()
            expect(mapServerErrorsToGraph(undefined, mockGraph)).toBeNull()
        })
    })

    describe('extractServerErrorMessages', () => {
        it('should extract user-friendly error messages', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.1.settings.template: output "{{age}}" not closed, line:5, col:1',
                            'steps.2.settings.url: Invalid URL format',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = extractServerErrorMessages(serverError)

            expect(result).toEqual([
                'output "{{age}}" not closed, line:5, col:1',
                'Invalid URL format',
            ])
        })

        it('should return empty array for non-validation errors', () => {
            const nonValidationError = new Error('Regular error')

            const result = extractServerErrorMessages(nonValidationError)

            expect(result).toEqual([])
        })

        it('should return raw messages when parsing fails', () => {
            const serverError: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'unparseable error message',
                            'steps.1.settings.template: valid error message',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = extractServerErrorMessages(serverError)

            expect(result).toEqual([
                'unparseable error message',
                'valid error message',
            ])
        })
    })

    describe('Integration scenarios', () => {
        it('should handle real-world liquid template error format', () => {
            const realError =
                'steps.1.settings.template: output "{{invalid_var | undefined_filter}}" not closed, line:12, col:45'
            const result = parseStepError(realError)

            expect(result).toEqual({
                stepIndex: 1,
                field: 'template',
                errorMessage:
                    'output "{{invalid_var | undefined_filter}}" not closed, line:12, col:45',
            })
        })

        it('should handle HTTP request validation errors', () => {
            const httpError =
                'steps.0.settings.url: The URL must be a valid HTTPS endpoint'
            const result = parseStepError(httpError)

            expect(result).toEqual({
                stepIndex: 0,
                field: 'url',
                errorMessage: 'The URL must be a valid HTTPS endpoint',
            })
        })

        it('should handle JSON body validation errors', () => {
            const jsonError =
                'steps.2.settings.json: Unexpected token at line:5, col:12 in JSON body'
            const result = parseStepError(jsonError)

            expect(result).toEqual({
                stepIndex: 2,
                field: 'json',
                errorMessage: 'Unexpected token at line:5, col:12 in JSON body',
            })
        })

        it('should skip step 0 (trigger) when mapping errors to nodes', () => {
            const testGraph: VisualBuilderGraph = {
                id: 'test-graph',
                internal_id: 'test-internal',
                is_draft: true,
                name: 'Test Graph',
                available_languages: ['en-US'],
                nodes: [
                    {
                        id: 'trigger-1',
                        type: 'channel_trigger',
                        position: { x: 0, y: 0 },
                        data: { errors: null },
                    } as any,
                    {
                        id: 'liquid-1',
                        type: 'liquid_template',
                        position: { x: 0, y: 100 },
                        data: {
                            name: 'Test Template',
                            template: '{{age}}',
                            errors: null,
                        },
                    } as any,
                    {
                        id: 'http-1',
                        type: 'http_request',
                        position: { x: 0, y: 200 },
                        data: {
                            name: 'Test Request',
                            url: 'invalid-url',
                            errors: null,
                        },
                    } as any,
                ],
                edges: [],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                isTemplate: false,
            }

            const multipleErrors: AxiosError = {
                name: 'AxiosError',
                message: 'Request failed',
                response: {
                    status: 400,
                    data: {
                        message: [
                            'steps.0.settings.template: First step error',
                            'steps.1.settings.url: Second step error',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                    statusText: 'Bad Request',
                    headers: {},
                    config: {} as any,
                },
                config: {} as any,
                isAxiosError: true,
                toJSON: () => ({}),
            }

            const result = mapServerErrorsToGraph(multipleErrors, testGraph)

            // Should map step 0 to node index 1 (skip trigger at index 0)
            // Should map step 1 to node index 2
            expect(result).toBeTruthy()
            expect(result!.nodes[1].data.errors).toEqual({
                template: 'First step error',
            })
            expect(result!.nodes[2].data.errors).toEqual({
                url: 'Second step error',
            })
        })
    })
})
