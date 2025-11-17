import type { AxiosError } from 'axios'
import _set from 'lodash/set'

import type { VisualBuilderGraph } from '../models/visualBuilderGraph.types'

interface ServerValidationError {
    message: string[]
    error: string
    statusCode: number
}

interface ParsedStepError {
    stepIndex: number
    field: string
    errorMessage: string
}

/**
 * Parses server validation error message to extract step index, field, and error message
 * Example: "steps.1.settings.template: output \"{{age}\" not closed, line:5, col:1"
 * Returns: { stepIndex: 1, field: "template", errorMessage: "output \"{{age}\" not closed, line:5, col:1" }
 */
export function parseStepError(errorMessage: string): ParsedStepError | null {
    const stepErrorRegex = /^steps\.(\d+)\.settings\.([^:]+):\s*(.+)$/
    const match = errorMessage.match(stepErrorRegex)

    if (!match) {
        return null
    }

    const [, stepIndexStr, field, errorMessage_] = match
    return {
        stepIndex: parseInt(stepIndexStr, 10),
        field,
        errorMessage: errorMessage_.trim(),
    }
}

/**
 * Maps server validation errors to visual builder graph node errors
 */
export function mapServerErrorsToGraph(
    error: unknown,
    graph: VisualBuilderGraph,
): VisualBuilderGraph | null {
    if (!isServerValidationError(error)) {
        return null
    }

    const serverError = error.response?.data as ServerValidationError
    const parsedErrors: ParsedStepError[] = []

    // Parse all error messages
    for (const message of serverError.message) {
        const parsed = parseStepError(message)
        if (parsed) {
            parsedErrors.push(parsed)
        }
    }

    if (parsedErrors.length === 0) {
        return null
    }

    // Create updated graph with server errors
    const updatedGraph = { ...graph }
    updatedGraph.nodes = [...graph.nodes]

    for (const { stepIndex, field, errorMessage } of parsedErrors) {
        // Skip trigger node (index 0), map to actual step nodes
        const nodeIndex = stepIndex + 1

        if (nodeIndex < updatedGraph.nodes.length) {
            const node = { ...updatedGraph.nodes[nodeIndex] }
            node.data = { ...node.data }

            // Set the error on the appropriate field
            if (!node.data.errors) {
                node.data.errors = {}
            }

            _set(node.data.errors, field, errorMessage)
            updatedGraph.nodes[nodeIndex] = node
        }
    }

    return updatedGraph
}

/**
 * Checks if an error is a server validation error we can parse
 */
function isServerValidationError(
    error: unknown,
): error is AxiosError<ServerValidationError> {
    if (!error || typeof error !== 'object') return false

    const axiosError = error as AxiosError
    return Boolean(
        axiosError.response?.status === 400 &&
            axiosError.response?.data &&
            typeof axiosError.response.data === 'object' &&
            'message' in axiosError.response.data &&
            Array.isArray(axiosError.response.data.message),
    )
}

/**
 * Extracts user-friendly error messages from server validation errors
 */
export function extractServerErrorMessages(error: unknown): string[] {
    if (!isServerValidationError(error)) {
        return []
    }

    const serverError = error.response?.data as ServerValidationError
    return serverError.message.map((message) => {
        const parsed = parseStepError(message)
        return parsed ? parsed.errorMessage : message
    })
}
