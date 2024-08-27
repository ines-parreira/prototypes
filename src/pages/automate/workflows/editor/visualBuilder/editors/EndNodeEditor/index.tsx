import React from 'react'
import Immutable from 'immutable'
import {Label} from '@gorgias/ui-kit'

import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import TicketAssignee from 'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee'
import {getHumanAgents} from 'state/agents/selectors'
import {getTeams} from 'state/teams/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {Drawer} from 'pages/common/components/Drawer'

import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import css from '../NodeEditor.less'
import WasThisHelpfulCard from './WasThisHelpfulCard'
import EndNodeTypeSelect from './EndNodeTypeSelect'

type EndNodeEditorProps = {
    nodeInEdition: EndNodeType
}

export default function EndNodeEditor({nodeInEdition}: EndNodeEditorProps) {
    const users = useAppSelector(getHumanAgents)
    const teams = useAppSelector(getTeams)
    const {dispatch} = useVisualBuilderContext()
    const handleAddTag = (tag: string) => {
        const {action, ticketTags, ticketAssigneeUserId, ticketAssigneeTeamId} =
            nodeInEdition.data
        dispatch({
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: nodeInEdition.id,
            settings: {
                action,
                ticketAssigneeUserId,
                ticketAssigneeTeamId,
                ticketTags: [...(ticketTags ?? []), tag],
            },
        })
    }
    const handleDeleteTag = (tag: string) => {
        const {action, ticketTags, ticketAssigneeUserId, ticketAssigneeTeamId} =
            nodeInEdition.data
        dispatch({
            type: 'SET_END_NODE_SETTINGS',
            endNodeId: nodeInEdition.id,
            settings: {
                action,
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
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label className={css.label}>Action</Label>
                        <EndNodeTypeSelect
                            value={nodeInEdition.data.action}
                            onChange={(action) => {
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
                                        action,
                                    },
                                })
                            }}
                        />
                    </div>
                    <div className={css.formField}>
                        {nodeInEdition.data.action === 'ask-for-feedback' && (
                            <div className={css.withDescription}>
                                <WasThisHelpfulCard />
                                <div className={css.description}>
                                    Customers will be asked for feedback and a
                                    ticket is created in the channel if
                                    customers select "No, I need more help".
                                    Feedback will always be requested in the
                                    channel language.
                                </div>
                            </div>
                        )}
                        {nodeInEdition.data.action === 'end' && (
                            <div className={css.description}>
                                The interaction will end and be considered
                                automated. Customers will not be able to create
                                a ticket and must leave the flow to ask for
                                further support.
                            </div>
                        )}
                        {(nodeInEdition.data.action === 'ask-for-feedback' ||
                            nodeInEdition.data.action === 'create-ticket') && (
                            <>
                                <Label className={css.label}>
                                    {nodeInEdition.data.action ===
                                    'ask-for-feedback'
                                        ? 'If'
                                        : 'When'}{' '}
                                    ticket is created
                                </Label>
                                <TicketTags
                                    ticketTags={Immutable.fromJS(
                                        (
                                            nodeInEdition.data.ticketTags ?? []
                                        ).map((tag) => ({
                                            name: tag,
                                        }))
                                    )}
                                    addTag={handleAddTag}
                                    removeTag={handleDeleteTag}
                                    transparent
                                />
                                <TicketAssignee
                                    currentAssigneeUser={ticketAssigneeUser}
                                    currentAssigneeTeam={ticketAssigneeTeam}
                                    handleTeams
                                    handleUsers
                                    setUser={(user) => {
                                        const {
                                            ticketTags,
                                            ticketAssigneeTeamId,
                                            action,
                                        } = nodeInEdition.data
                                        dispatch({
                                            type: 'SET_END_NODE_SETTINGS',
                                            endNodeId: nodeInEdition.id,
                                            settings: {
                                                ticketTags,
                                                ticketAssigneeUserId: user?.id,
                                                ticketAssigneeTeamId,
                                                action,
                                            },
                                        })
                                    }}
                                    setTeam={(team) => {
                                        const {
                                            ticketTags,
                                            ticketAssigneeUserId,
                                            action,
                                        } = nodeInEdition.data
                                        dispatch({
                                            type: 'SET_END_NODE_SETTINGS',
                                            endNodeId: nodeInEdition.id,
                                            settings: {
                                                ticketTags,
                                                ticketAssigneeUserId,
                                                ticketAssigneeTeamId: team?.id,
                                                action,
                                            },
                                        })
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Drawer.Content>
        </>
    )
}
