import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {List, Map} from 'immutable'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
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

    const handleSubmit = async ({
        buttonLabel,
        responseText,
        attachments,
    }: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
        attachments: List<any>
    }) => {
        const newQuickResponses = quickResponses.map((quickResponse) =>
            quickResponseId === quickResponse.id
                ? {
                      ...quickResponse,
                      title: buttonLabel,
                      response_message_content: {
                          html: responseText.message.get('html'),
                          text: responseText.message.get('text'),
                          attachments,
                      },
                  }
                : quickResponse
        )

        await updateQuickReplyPolicies({
            newQuickRepliesPolicy: newQuickResponses,
            message: 'Flow successfully updated',
        })
        logEvent(SegmentEvent.QuickResponseFlowEdited, {
            id: quickResponseId,
            buttonLabel,
            responseText,
            attachments,
        })
        history.push(baseURL)
    }

    const handleDelete = async () => {
        const newQuickResponses = quickResponses.filter(
            (quickResponse) => quickResponseId !== quickResponse.id
        )

        await updateQuickReplyPolicies({
            newQuickRepliesPolicy: newQuickResponses,
            message: 'Flow successfully deleted',
        })
        logEvent(SegmentEvent.QuickResponseFlowDeleted, {
            id: quickResponseId,
        })
        history.push(baseURL)
    }

    return (
        <QuickResponseFlowItem
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            quickResponseBeingEdited={quickResponseBeingEdited}
        />
    )
}

export default QuickResponseFlowEditItem
