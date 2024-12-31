import React from 'react'

import VisualBuilderNodeIconContent from '../editor/visualBuilder/nodes/VisualBuilderNodeIconContent'

type Props = {
    hasMissingCredentials?: boolean
    hasCredentials?: boolean
    hasAllValues?: boolean
    hasMissingValues?: boolean
}

const ReusableLLMPromptCallNodeStatusLabel = ({
    hasMissingCredentials,
    hasCredentials,
    hasAllValues,
    hasMissingValues,
}: Props) => {
    if (hasMissingCredentials && hasMissingValues) {
        return (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Authentication and values required
            </VisualBuilderNodeIconContent>
        )
    }

    if (hasMissingCredentials) {
        return (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Authentication required
            </VisualBuilderNodeIconContent>
        )
    }

    if (hasMissingValues) {
        return (
            <VisualBuilderNodeIconContent icon="warning" type="warning">
                Values required
            </VisualBuilderNodeIconContent>
        )
    }

    if (hasCredentials && hasAllValues) {
        return (
            <VisualBuilderNodeIconContent icon="edit">
                Edit authentication and values
            </VisualBuilderNodeIconContent>
        )
    }

    if (hasCredentials) {
        return (
            <VisualBuilderNodeIconContent icon="edit">
                Edit authentication
            </VisualBuilderNodeIconContent>
        )
    }

    if (hasAllValues) {
        return (
            <VisualBuilderNodeIconContent icon="edit">
                Edit values
            </VisualBuilderNodeIconContent>
        )
    }

    return null
}

export default ReusableLLMPromptCallNodeStatusLabel
