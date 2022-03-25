import React, {useMemo} from 'react'
import {produce} from 'immer'

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

    const handleSubmit = ({
        buttonLabel,
        responseText,
    }: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
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
                    },
                })
            }
        )
        void updateQuickReplyPolicies(newQuickResponses)

        history.push(baseURL)
    }

    return <QuickResponseFlowItem handleSubmit={handleSubmit} />
}

export default QuickResponseFlowNewItem
