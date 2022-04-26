import React, {useMemo} from 'react'
import {useLatest} from 'react-use'
import {Table} from 'reactstrap'
import {produce} from 'immer'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import Button from 'pages/common/components/button/Button'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'
import history from 'pages/history'

import {useConfigurationData} from '../../../hooks'
import {QuickReplyPolicy} from '../../../../../../../models/selfServiceConfiguration/types'
import {useUpdateQuickReplyPolicies} from '../../../QuickResponseFlowItem/hooks'

import QuickResponseListItem from '../QuickResponseListItem'
import css from './QuickResponseList.less'

const QuickResponseList = () => {
    const configuration = useConfigurationData()
    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response/`

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    // handleDragAndDrop is not updated inside ReactSortable between renders
    // So we access the latest quick responses array via this hook
    const latestQuickResponsesWithIds = useLatest(quickResponses)

    const handleAddFlow = () => {
        history.push(baseURL.concat('new'))
    }

    const {updateQuickReplyPolicies} = useUpdateQuickReplyPolicies()

    const handleEditClick = (position: number) => () => {
        const id = quickResponses[position].id
        history.push(baseURL.concat(id ?? ''))
    }

    const handleToggleClick = (position: number) => async () => {
        let type = SegmentEvent.QuickResponseFlowActivated
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                if (quickResponses[position].deactivated_datetime) {
                    quickResponsesDraft[position].deactivated_datetime = null
                } else {
                    quickResponsesDraft[position].deactivated_datetime =
                        new Date().toISOString()
                    type = SegmentEvent.QuickResponseFlowDeactivated
                }
            }
        )

        await updateQuickReplyPolicies({
            newQuickRepliesPolicy: newQuickResponses,
            message: 'Flow successfully updated',
        })
        logEvent(type, {
            id: quickResponses[position].id,
        })
    }

    const handleDragAndDrop = (sortedIds: string[]) => {
        const sortedResponsePolicies = sortedIds.map((id) => {
            const foundResponse = latestQuickResponsesWithIds.current.find(
                (response) => response.title === id
            )
            return foundResponse
        }) as QuickReplyPolicy[]

        void updateQuickReplyPolicies({
            newQuickRepliesPolicy: sortedResponsePolicies,
            message: 'Flow successfully updated',
        })
    }

    const numberOfActiveFlows = useMemo(() => {
        return quickResponses.filter(
            (response) => !response.deactivated_datetime
        ).length
    }, [quickResponses])

    const isLimitReached = numberOfActiveFlows >= 4

    return (
        <>
            {quickResponses.length > 0 && (
                <Table className={css.table}>
                    <thead>
                        <tr>
                            <th style={{width: 25}} />
                            <th style={{width: 25}} />
                            <th />
                            <th style={{width: 50}} />
                        </tr>
                    </thead>
                    <ReactSortable
                        tag="tbody"
                        options={{
                            draggable: '.draggable',
                            handle: '.drag-handle',
                            animation: 150,
                        }}
                        onChange={handleDragAndDrop}
                    >
                        {quickResponses.map((response, index) => (
                            <QuickResponseListItem
                                key={response.title}
                                title={response.title}
                                enabled={!response.deactivated_datetime}
                                isLimitReached={isLimitReached}
                                position={index}
                                onEditClick={handleEditClick(index)}
                                onToggle={handleToggleClick(index)}
                            />
                        ))}
                    </ReactSortable>
                </Table>
            )}

            <Button onClick={handleAddFlow}>
                <span className="material-icons">add</span>
                Add flow
            </Button>
        </>
    )
}

export default QuickResponseList
