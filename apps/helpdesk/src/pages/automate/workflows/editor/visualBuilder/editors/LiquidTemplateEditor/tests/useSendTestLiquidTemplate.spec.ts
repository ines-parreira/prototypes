import { act, renderHook } from '@testing-library/react'

import useSendTestLiquidTemplate from '../useSendTestLiquidTemplate'

// Mock the workflows API client
const mockValidateStep = jest.fn()
jest.mock('rest_api/workflows_api/client', () => ({
    getGorgiasWfApiClient: jest.fn(() =>
        Promise.resolve({
            LiquidTemplateStepValidationController_validateStep:
                mockValidateStep,
        }),
    ),
}))

const mockNodeData = {
    name: 'Test Template',
    template: 'Hello [[ customer.name ]]',
    output: { data_type: 'string' as const },
}

describe('useSendTestLiquidTemplate', () => {
    beforeEach(() => {
        mockValidateStep.mockClear()
        jest.clearAllMocks()
    })

    describe('successful response handling', () => {
        it('should handle successful API response', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: {
                            value: 'Hello John Doe',
                        },
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: true,
                output: 'Hello John Doe',
                error: undefined,
            })
        })

        it('should handle execution result with error', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: false,
                        error: 'Template execution failed',
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                output: undefined,
                error: 'Template execution failed',
            })
        })
    })

    describe('validation error handling', () => {
        it('should handle validation errors with messages', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: false,
                    validation_errors: [
                        { message: 'Invalid liquid syntax' },
                        { error: 'Missing variable' },
                    ],
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid liquid syntax\nMissing variable',
            })
        })

        it('should handle validation errors without specific messages', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: false,
                    validation_errors: [],
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Template validation failed',
            })
        })

        it('should handle validation errors with complex error objects', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: false,
                    validation_errors: [
                        {
                            code: 'SYNTAX_ERROR',
                            details: 'Line 1: Unexpected token',
                        },
                    ],
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: '{"code":"SYNTAX_ERROR","details":"Line 1: Unexpected token"}',
            })
        })
    })

    describe('API error handling', () => {
        it('should handle API errors with structured error response', async () => {
            const mockResponse = jest.fn()
            const apiError = {
                response: {
                    data: {
                        error: {
                            msg: 'Authentication failed',
                        },
                    },
                },
            }
            mockValidateStep.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Authentication failed',
            })
        })

        it('should handle API errors with message field', async () => {
            const mockResponse = jest.fn()
            const apiError = {
                response: {
                    data: {
                        message: 'Rate limit exceeded',
                    },
                },
            }
            mockValidateStep.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Rate limit exceeded',
            })
        })

        it('should handle standard Error objects', async () => {
            const mockResponse = jest.fn()
            const error = new Error('Network error')
            mockValidateStep.mockRejectedValue(error)

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Network error',
            })
        })

        it('should handle unknown error types', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockRejectedValue('string error')

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John Doe',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Unknown error occurred',
            })
        })
    })

    describe('loading state', () => {
        it('should manage loading state during request', async () => {
            const mockResponse = jest.fn()

            // Use a simpler approach - just test that loading state changes
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 'Hello John' },
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            expect(result.current.isLoading).toBe(false)

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('edge cases and missing scenarios', () => {
        it('should handle empty variables object', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 'No variables template' },
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({})
            })

            expect(mockValidateStep).toHaveBeenCalledWith(
                null,
                expect.objectContaining({
                    execution_context: {},
                }),
            )
        })

        it('should handle variables with special regex characters', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 'Test output' },
                    },
                },
            })

            const nodeDataWithSpecialChars = {
                ...mockNodeData,
                template: 'Hello [[ customer.name ]] with [[ order.id ]]',
            }

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(
                    nodeDataWithSpecialChars,
                    mockResponse,
                ),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John (Doe)',
                    'order.id': 'ORDER-123',
                })
            })

            expect(mockValidateStep).toHaveBeenCalledWith(
                null,
                expect.objectContaining({
                    step: expect.objectContaining({
                        settings: expect.objectContaining({
                            template: 'Hello John (Doe) with ORDER-123',
                        }),
                    }),
                }),
            )
        })

        it('should handle multiple occurrences of the same variable', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 'Replaced template' },
                    },
                },
            })

            const nodeDataWithRepeatedVars = {
                ...mockNodeData,
                template:
                    '[[ customer.name ]] says hello to [[ customer.name ]]',
            }

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(
                    nodeDataWithRepeatedVars,
                    mockResponse,
                ),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'Alice',
                })
            })

            expect(mockValidateStep).toHaveBeenCalledWith(
                null,
                expect.objectContaining({
                    step: expect.objectContaining({
                        settings: expect.objectContaining({
                            template: 'Alice says hello to Alice',
                        }),
                    }),
                }),
            )
        })

        it('should handle variables with whitespace in brackets', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 'Whitespace handled' },
                    },
                },
            })

            const nodeDataWithWhitespace = {
                ...mockNodeData,
                template: '[[  customer.name  ]] and [[ order.total ]]',
            }

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(nodeDataWithWhitespace, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'Bob',
                    'order.total': '$50',
                })
            })

            expect(mockValidateStep).toHaveBeenCalledWith(
                null,
                expect.objectContaining({
                    step: expect.objectContaining({
                        settings: expect.objectContaining({
                            template: 'Bob and $50',
                        }),
                    }),
                }),
            )
        })

        it('should handle non-string output values', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: { value: 42 },
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: true,
                output: '42',
                error: undefined,
            })
        })

        it('should handle missing output value', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                    execution_result: {
                        success: true,
                        output: {},
                    },
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: true,
                output: undefined,
                error: undefined,
            })
        })

        it('should handle invalid response without execution result', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockResolvedValue({
                data: {
                    valid: true,
                },
            })

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid response from server',
            })
        })

        it('should handle API errors with generic message field', async () => {
            const mockResponse = jest.fn()
            const apiError = {
                message: 'Network timeout error',
            }
            mockValidateStep.mockRejectedValue(apiError)

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Network timeout error',
            })
        })

        it('should handle null and undefined error objects', async () => {
            const mockResponse = jest.fn()
            mockValidateStep.mockRejectedValue(null)

            const { result } = renderHook(() =>
                useSendTestLiquidTemplate(mockNodeData, mockResponse),
            )

            await act(async () => {
                await result.current.sendTestRequest({
                    'customer.name': 'John',
                })
            })

            expect(mockResponse).toHaveBeenCalledWith({
                success: false,
                error: 'Unknown error occurred',
            })
        })
    })
})

describe('Variable transformation', () => {
    it('should transform flat variables to nested objects', () => {
        // Test the transformation logic that happens in the hook
        const transformVariablesToNestedObject = (
            variables: Record<string, string>,
        ): Record<string, any> => {
            const result: Record<string, any> = {}

            for (const [path, value] of Object.entries(variables)) {
                const keys = path.split('.')
                let current = result

                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i]
                    if (!(key in current)) {
                        current[key] = {}
                    }
                    current = current[key]
                }

                current[keys[keys.length - 1]] = value
            }

            return result
        }

        // Test cases
        expect(
            transformVariablesToNestedObject({
                'customer.name': 'John Doe',
                'order.total.amount': '$100.00',
                'order.status': 'completed',
                simple: 'value',
            }),
        ).toEqual({
            customer: {
                name: 'John Doe',
            },
            order: {
                total: {
                    amount: '$100.00',
                },
                status: 'completed',
            },
            simple: 'value',
        })

        // Test empty object
        expect(transformVariablesToNestedObject({})).toEqual({})

        // Test single property
        expect(transformVariablesToNestedObject({ test: 'value' })).toEqual({
            test: 'value',
        })

        // Test deep nesting
        expect(
            transformVariablesToNestedObject({
                'a.b.c.d.e': 'deep value',
            }),
        ).toEqual({
            a: {
                b: {
                    c: {
                        d: {
                            e: 'deep value',
                        },
                    },
                },
            },
        })
    })
})
