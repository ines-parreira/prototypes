import {Label} from '@gorgias/merchant-ui-kit'
import Immutable from 'immutable'
import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {Drawer} from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'
import TicketAssignee from 'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import {getHumanAgents} from 'state/agents/selectors'
import {getTeams} from 'state/teams/selectors'

import NodeEditorDrawerHeader from '../../NodeEditorDrawerHeader'
import css from '../NodeEditor.less'
import EndNodeTypeSelect from './EndNodeTypeSelect'
import WasThisHelpfulCard from './WasThisHelpfulCard'

type EndNodeEditorProps = {
    nodeInEdition: EndNodeType
}

export default function EndNodeEditor({nodeInEdition}: EndNodeEditorProps) {
    const users = useAppSelector(getHumanAgents)
    const teams = useAppSelector(getTeams)
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()
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

    const triggerNode = visualBuilderGraph.nodes[0]

    const actionOptions = useMemo<EndNodeType['data']['action'][]>(() => {
        switch (triggerNode.type) {
            case 'llm_prompt_trigger':
            case 'reusable_llm_prompt_trigger':
                return ['end-success', 'end-failure']
            case 'channel_trigger':
                return ['ask-for-feedback', 'create-ticket', 'end']
            default:
                return []
        }
    }, [triggerNode.type])

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label>Action</Label>
                        <EndNodeTypeSelect
                            options={actionOptions}
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
                            <div>
                                <WasThisHelpfulCard />
                                <Caption>
                                    {`Customers will be asked for feedback and a ticket is created in the channel if customers select "No, I need more help". Feedback will always be requested in the channel language.`}
                                </Caption>
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
                                <Label>
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
