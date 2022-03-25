import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'

import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import history from 'pages/history'

import QuickResponseFlowItem from '../QuickResponseFlowItem/QuickResponseFlowItem'
import {useUpdateQuickReplyPolicies} from '../QuickResponseFlowItem/hooks'

const QuickResponseFlowEditItem = () => {
    const configuration = useConfigurationData()

    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response`

    const {quickResponseId} = useParams<{
        quickResponseId: string
    }>()

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    const {updateQuickReplyPolicies} = useUpdateQuickReplyPolicies()

    const quickResponseBeingEdited = quickResponses.find(
        (quickResponse) => quickResponse.id === quickResponseId
    )

    if (!quickResponseBeingEdited) {
        return null
    }

    const handleSubmit = ({
        buttonLabel,
        responseText,
    }: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
    }) => {
        const newQuickResponses = quickResponses.map((quickResponse) =>
            quickResponseId === quickResponse.id
                ? {
                      ...quickResponse,
                      title: buttonLabel,
                      response_message_content: {
                          html: responseText.message.get('html'),
                          text: responseText.message.get('text'),
                      },
                  }
                : quickResponse
        )

        void updateQuickReplyPolicies(newQuickResponses)
        history.push(baseURL)
    }

    const handleDelete = () => {
        const newQuickResponses = quickResponses.filter(
            (quickResponse) => quickResponseId !== quickResponse.id
        )

        void updateQuickReplyPolicies(newQuickResponses)
        history.push(baseURL)
    }

    return (
        <QuickResponseFlowItem
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            initialValue={{
                buttonLabel: quickResponseBeingEdited.title,
                responseText: {
                    message: fromJS(
                        quickResponseBeingEdited.response_message_content
                    ),
                },
            }}
        />
    )
}

export default QuickResponseFlowEditItem
