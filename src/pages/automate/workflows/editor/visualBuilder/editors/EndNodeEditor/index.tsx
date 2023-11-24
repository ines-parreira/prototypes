import React, {useCallback, useState} from 'react'
import Immutable from 'immutable'

import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import Label from 'pages/common/forms/Label/Label'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import TicketAssignee from 'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee'
import {getAgents} from 'state/agents/selectors'
import {getTeams} from 'state/teams/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from '../NodeEditor.less'
import WasThisHelpfulCard from './WasThisHelpfulCard'
import EndNodeTypeSelect from './EndNodeTypeSelect'

type EndNodeEditorProps = {
    nodeInEdition: EndNodeType
}

export default function EndNodeEditor({nodeInEdition}: EndNodeEditorProps) {
    const users = useAppSelector(getAgents)
    const teams = useAppSelector(getTeams)
    const [dropdownContainerRef, setDropdownContainerRef] =
        useState<HTMLDivElement | null>(null)
    const onDropdownContainerRefChange = useCallback(
        (node: HTMLDivElement | null) => {
            setDropdownContainerRef(node)
        },
        []
    )
    const {dispatch} = useWorkflowEditorContext()
    const handleAddTag = (tag: string) => {
        const {
            withWasThisHelpfulPrompt,
            ticketTags,
            ticketAssigneeUserId,
            ticketAssigneeTeamId,
        } = nodeInEdition.data
        dispatch({
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: nodeInEdition.id,
            settings: {
                withWasThisHelpfulPrompt,
                ticketAssigneeUserId,
                ticketAssigneeTeamId,
                ticketTags: [...(ticketTags ?? []), tag],
            },
        })
    }
    const handleDeleteTag = (tag: string) => {
        const {
            withWasThisHelpfulPrompt,
            ticketTags,
            ticketAssigneeUserId,
            ticketAssigneeTeamId,
        } = nodeInEdition.data
        dispatch({
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: nodeInEdition.id,
            settings: {
                withWasThisHelpfulPrompt,
                ticketAssigneeUserId,
                ticketAssigneeTeamId,
                ticketTags: (ticketTags ?? []).filter((t) => t !== tag),
            },
        })
    }
    const ticketAssigneeUser = users.find(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (u) => u.get('id') === nodeInEdition.data.ticketAssigneeUserId
    )
    const ticketAssigneeTeam = teams.find(
        (t) => t?.get('id') === nodeInEdition.data.ticketAssigneeTeamId
    )
    return (
        <div className={css.container}>
            <div className={css.formField}>
                <Label className={css.label}>Action</Label>
                <EndNodeTypeSelect
                    withWasThisHelpfulPrompt={
                        nodeInEdition.data.withWasThisHelpfulPrompt
                    }
                    onChange={(withWasThisHelpfulPrompt) => {
                        const {
                            ticketTags,
                            ticketAssigneeUserId,
                            ticketAssigneeTeamId,
                        } = nodeInEdition.data
                        dispatch({
                            type: 'SET_END_NODE_SETTINGS',
                            endNodeId: nodeInEdition.id,
                            settings: {
                                ticketTags,
                                ticketAssigneeUserId,
                                ticketAssigneeTeamId,
                                withWasThisHelpfulPrompt,
                            },
                        })
                    }}
                />
            </div>
            <div className={css.formField} ref={onDropdownContainerRefChange}>
                {nodeInEdition.data.withWasThisHelpfulPrompt ? (
                    <div className={css.withDescription}>
                        <WasThisHelpfulCard />
                        <div className={css.description}>
                            Customers will be asked for feedback and a ticket is
                            created in the channel if customers select "No, I
                            need more help". Feedback will always be requested
                            in the channel language.
                        </div>
                    </div>
                ) : (
                    <>
                        <Label className={css.label}>
                            When ticket is created
                        </Label>
                        <TicketTags
                            ticketTags={Immutable.fromJS(
                                (nodeInEdition.data.ticketTags ?? []).map(
                                    (tag) => ({
                                        name: tag,
                                    })
                                )
                            )}
                            addTag={handleAddTag}
                            removeTag={handleDeleteTag}
                            transparent
                            dropdownContainer={
                                dropdownContainerRef ?? undefined
                            }
                        />
                        <TicketAssignee
                            className={css.assignee}
                            currentAssigneeUser={ticketAssigneeUser}
                            currentAssigneeTeam={ticketAssigneeTeam}
                            handleTeams={true}
                            handleUsers={true}
                            setUser={(user) => {
                                const {
                                    ticketTags,
                                    ticketAssigneeTeamId,
                                    withWasThisHelpfulPrompt,
                                } = nodeInEdition.data
                                dispatch({
                                    type: 'SET_END_NODE_SETTINGS',
                                    endNodeId: nodeInEdition.id,
                                    settings: {
                                        ticketTags,
                                        ticketAssigneeUserId: user?.id,
                                        ticketAssigneeTeamId,
                                        withWasThisHelpfulPrompt,
                                    },
                                })
                            }}
                            setTeam={(team) => {
                                const {
                                    ticketTags,
                                    ticketAssigneeUserId,
                                    withWasThisHelpfulPrompt,
                                } = nodeInEdition.data
                                dispatch({
                                    type: 'SET_END_NODE_SETTINGS',
                                    endNodeId: nodeInEdition.id,
                                    settings: {
                                        ticketTags,
                                        ticketAssigneeUserId,
                                        ticketAssigneeTeamId: team?.id,
                                        withWasThisHelpfulPrompt,
                                    },
                                })
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
