import {
    ListUsersRelationshipsItem,
    useListUsers,
} from '@gorgias/helpdesk-queries'

import { AgentWithStatus } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import { AgentLabel } from 'pages/common/utils/labels'
import { getHumanAgentsJS } from 'state/agents/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import DropdownSection from '../../../dropdown/DropdownSection'
import {
    getAvailabilityBadgeColor,
    getAvailabilityStatus,
    mergeAgentData,
} from '../utils'

import css from './CallTransferDropdown.less'

type Props = {
    setSelectedAgentId: (agentId: number) => void
    clearErrors?: () => void
}

const AgentCallTransferDropdownContent = ({
    setSelectedAgentId,
    clearErrors,
}: Props) => {
    const { data: agentsDataWithStatus } = useListUsers(
        {
            limit: 100,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
            available_first: true,
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
        },
    )

    const agents = useAppSelector(getHumanAgentsJS)
    const currentAgentId = useAppSelector(getCurrentUserId)

    const filteredAgents = agents.filter((agent) => agent.id !== currentAgentId)
    const mergedAgentData = mergeAgentData(
        filteredAgents,
        agentsDataWithStatus?.data?.data,
    )
    const availableAgents = mergedAgentData.filter(
        (agent) => agent.status === 'online',
    )
    const unavailableAgents = mergedAgentData.filter(
        (agent) => agent.status !== 'online',
    )

    return (
        <>
            <DropdownSearch />
            <DropdownBody className={css.dropdownBody} onClick={clearErrors}>
                <DropdownSection
                    title={`Available (${availableAgents.length})`}
                    alwaysRender
                >
                    {availableAgents.map((agent) => (
                        <AgentDropdownItem
                            key={`agent-${agent.id}`}
                            agent={agent}
                            onSelect={setSelectedAgentId}
                        />
                    ))}
                </DropdownSection>
                <DropdownSection
                    title={`Unavailable (${unavailableAgents.length})`}
                    alwaysRender
                >
                    {unavailableAgents.map((agent) => (
                        <AgentDropdownItem
                            key={`agent-${agent.id}`}
                            agent={agent}
                            onSelect={setSelectedAgentId}
                            isDisabled
                        />
                    ))}
                </DropdownSection>
            </DropdownBody>
        </>
    )
}

type AgentDropdownItemProps = {
    agent: AgentWithStatus
    onSelect: (agentId: number) => void
    isDisabled?: boolean
}

const AgentDropdownItem = ({
    agent,
    onSelect,
    isDisabled = false,
}: AgentDropdownItemProps) => {
    return (
        <DropdownItem
            option={{
                label: agent.name,
                value: agent.id,
            }}
            onClick={onSelect}
            isDisabled={isDisabled}
        >
            <AgentLabel
                shouldDisplayAvatar
                name={agent.name}
                profilePictureUrl={agent.meta?.profile_picture_url}
                badgeColor={getAvailabilityBadgeColor(agent.status)}
                status={getAvailabilityStatus(agent.status)}
            />
        </DropdownItem>
    )
}

export default AgentCallTransferDropdownContent
