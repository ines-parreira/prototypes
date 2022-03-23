import React, {useMemo} from 'react'
import {produce} from 'immer'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'

import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import history from 'pages/history'

import QuickResponseFlowItem from '../QuickResponseFlowItem/QuickResponseFlowItem'
import useUpdateQuickReplyPolicies from '../QuickResponseFlowItem/hooks'

const QuickResponseFlowEditItem = () => {
    const configuration = useConfigurationData()

    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response`

    const {quickResponseId: quickResponseIdString} = useParams<{
        quickResponseId: string
    }>()

    const quickResponseId = parseInt(quickResponseIdString, 10)

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    const {updateQuickReplyPolicies} = useUpdateQuickReplyPolicies()

    const handleSubmit = ({
        buttonLabel,
    }: // responseText,
    {
        buttonLabel: string
        responseText: {message: Map<any, any>}
    }) => {
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                quickResponsesDraft[quickResponseId].title = buttonLabel
            }
        )
        void updateQuickReplyPolicies(newQuickResponses)
        history.push(baseURL)
    }

    const handleDelete = () => {
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                quickResponsesDraft.splice(quickResponseId, 1)
            }
        )

        void updateQuickReplyPolicies(newQuickResponses)
        history.push(baseURL)
    }

    if (quickResponses.length === 0) {
        return null
    }

    return (
        <QuickResponseFlowItem
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            initialValue={{
                buttonLabel: quickResponses[quickResponseId].title,
                responseText: {message: fromJS({})},
            }}
        />
    )
}

export default QuickResponseFlowEditItem
