import React, {useMemo} from 'react'
import {produce} from 'immer'

import {List, Map} from 'immutable'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import history from 'pages/history'
import QuickResponseFlowItem from '../QuickResponseFlowItem/QuickResponseFlowItem'
import {useUpdateQuickReplyPolicies} from '../QuickResponseFlowItem/hooks'

const QuickResponseFlowNewItem = () => {
    const configuration = useConfigurationData()

    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response`

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    const isLimitReached = useMemo(() => {
        return (
            quickResponses.filter((response) => !response.deactivated_datetime)
                .length >= 4
        )
    }, [quickResponses])

    const {updateQuickReplyPolicies} = useUpdateQuickReplyPolicies()

    const handleSubmit = async ({
        buttonLabel,
        responseText,
        attachments,
    }: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
        attachments: List<any>
    }) => {
        const deactivatedDatetime = isLimitReached
            ? new Date().toISOString()
            : null
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                quickResponsesDraft.push({
                    title: buttonLabel,
                    deactivated_datetime: deactivatedDatetime,
                    response_message_content: {
                        html: responseText.message.get('html'),
                        text: responseText.message.get('text'),
                        attachments,
                    },
                })
            }
        )
        await updateQuickReplyPolicies({
            newQuickRepliesPolicy: newQuickResponses,
            message: 'Flow successfully created',
        })
        logEvent(SegmentEvent.QuickResponseFlowCreated, {
            buttonLabel,
            responseText,
            attachments,
        })

        history.push(baseURL)
    }

    return <QuickResponseFlowItem handleSubmit={handleSubmit} />
}

export default QuickResponseFlowNewItem

// failing tests
// QuickResponseFlowEditItem
// QuickResponseFlowNewItem
