import type { TicketMessage } from 'models/ticket/types'

export const getFailedWorkflowData = (message: TicketMessage) => {
    const workflowData = extractFailedWorkflowMetaData(message)
    if (workflowData) return workflowData
    // If no meta data, try to extract from the message for backwards compatability
    return extractWorkflowDataFromMessage(message)
}

const extractFailedWorkflowMetaData = (message: TicketMessage) => {
    if (message.meta?.workflow_execution?.success !== false) return null
    const workflowMeta = message.meta?.workflow_execution
    return {
        configurationId: workflowMeta?.configuration_id,
        executionId: workflowMeta?.execution_id,
        success: workflowMeta?.success,
    }
}

// Validate if the message is an existing workflow failure message
// and attept to extract the workflow data from the body_html
const extractWorkflowDataFromMessage = (message: TicketMessage) => {
    if (
        !message.body_html ||
        !isExistingWorkflowFailureMessage(message.body_html) ||
        !hasErrorSummary(message.body_html)
    )
        return null
    return extractWorkflowDataFromUrl(message.body_html)
}

const isExistingWorkflowFailureMessage = (html: string) => {
    return /AI Agent did not send a response and handed over the ticket to your team because it failed to execute one or more steps in this Action/.test(
        html,
    )
}

const hasErrorSummary = (html: string) => {
    return /<div data-error-summary="true">/.test(html)
}

const extractWorkflowDataFromUrl = (html: string) => {
    const urlRegex =
        /\/ai-agent\/actions\/events\/([^?]+)\?execution_id=([^"]+)/
    const match = html.match(urlRegex)
    if (match) {
        return {
            configurationId: match[1],
            executionId: match[2],
            success: false,
        }
    }
    return null
}
