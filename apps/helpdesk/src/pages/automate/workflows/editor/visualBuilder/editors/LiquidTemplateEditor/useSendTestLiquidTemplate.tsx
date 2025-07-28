import { useCallback, useState } from 'react'

import { LiquidTemplateNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'

type TestResult = {
    success: boolean
    output?: string
    error?: string
}

// Transform flat variable paths into nested objects
// e.g., { 'a.b.c': 'value' } becomes { a: { b: { c: 'value' } } }
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

const useSendTestLiquidTemplate = (
    nodeData: LiquidTemplateNodeType['data'],
    onResponse: (result: TestResult) => void,
) => {
    const [isLoading, setIsLoading] = useState(false)

    const sendTestRequest = useCallback(
        async (variables: Record<string, string> = {}) => {
            setIsLoading(true)

            try {
                // Replace workflow variables [[var]] with their values
                let processedTemplate = nodeData.template
                for (const [variablePath, value] of Object.entries(variables)) {
                    processedTemplate = processedTemplate.replace(
                        new RegExp(
                            `\\[\\[\\s*${variablePath.replace(/\./g, '\\.')}\\s*\\]\\]`,
                            'g',
                        ),
                        value,
                    )
                }

                // Transform flat variables into nested object structure
                const executionContext =
                    transformVariablesToNestedObject(variables)

                const client = await getGorgiasWfApiClient()
                const { data } =
                    await client.LiquidTemplateStepValidationController_validateStep(
                        null,
                        {
                            step: {
                                id: 'test-liquid-template',
                                kind: 'liquid-template',
                                settings: {
                                    name: nodeData.name,
                                    template: processedTemplate,
                                    output: nodeData.output,
                                },
                            },
                            execution_context: executionContext,
                        },
                    )

                if (data.valid && data.execution_result) {
                    onResponse({
                        success: data.execution_result.success,
                        output: data.execution_result.output?.value?.toString(),
                        error: data.execution_result.error,
                    })
                } else if (!data.valid) {
                    // Handle validation errors
                    const validationErrors =
                        (data as any).validation_errors || []
                    const errorMessage =
                        validationErrors.length > 0
                            ? validationErrors
                                  .map(
                                      (err: any) =>
                                          err.message ||
                                          err.error ||
                                          JSON.stringify(err),
                                  )
                                  .join('\n')
                            : 'Template validation failed'

                    onResponse({
                        success: false,
                        error: errorMessage,
                    })
                } else {
                    onResponse({
                        success: false,
                        error: 'Invalid response from server',
                    })
                }
            } catch (error) {
                console.error('Error testing liquid template:', error)

                let errorMessage = 'Unknown error occurred'

                if (error instanceof Error) {
                    errorMessage = error.message
                } else if (typeof error === 'object' && error !== null) {
                    // Handle API error responses
                    const apiError = error as any
                    if (apiError.response?.data?.error?.msg) {
                        errorMessage = apiError.response.data.error.msg
                    } else if (apiError.response?.data?.message) {
                        errorMessage = apiError.response.data.message
                    } else if (apiError.message) {
                        errorMessage = apiError.message
                    }
                }

                onResponse({
                    success: false,
                    error: errorMessage,
                })
            } finally {
                setIsLoading(false)
            }
        },
        [nodeData, onResponse],
    )

    return { isLoading, sendTestRequest }
}

export default useSendTestLiquidTemplate
