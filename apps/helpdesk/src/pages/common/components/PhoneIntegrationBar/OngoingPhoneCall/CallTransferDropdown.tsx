import { ComponentProps, useState } from 'react'

import { Call } from '@twilio/voice-sdk'
import { get } from 'lodash'

import { Button } from '@gorgias/axiom'
import {
    ListUsersRelationshipsItem,
    useListUsers,
    useTransferCall,
    VoiceCallTransferReceiverType,
    VoiceCallTransferType,
} from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { AgentWithStatus } from 'config/types/user'
import { useFlag } from 'core/flags'
import { getCallSid } from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownAlertBanner, {
    AlertBannerData,
} from 'pages/common/components/dropdown/DropdownAlertBanner'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import { AgentLabel } from 'pages/common/utils/labels'
import { getHumanAgentsJS } from 'state/agents/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import DropdownSection from '../../dropdown/DropdownSection'
import {
    getAvailabilityBadgeColor,
    getAvailabilityStatus,
    mergeAgentData,
} from './utils'

import css from './CallTransferDropdown.less'

enum TransferType {
    Agents = 'agents',
    Queues = 'queues',
    External = 'external',
}

type Props = Pick<
    ComponentProps<typeof Dropdown>,
    'isOpen' | 'target' | 'placement'
> & {
    onTransferInitiated: (transferringTo: number | null) => void
    setIsOpen: (isOpen: boolean) => void
    call: Call
}

export default function CallTransferDropdown({
    isOpen,
    setIsOpen,
    target,
    placement = 'top',
    onTransferInitiated,
    call,
}: Props) {
    const isTransferToExternalNumberEnabled = useFlag(
        FeatureFlagKey.TransferCallToExternalNumber,
    )

    const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
    const [selectedTransferType, setSelectedTransferType] =
        useState<TransferType>(TransferType.Agents)
    const dispatch = useAppDispatch()
    const [alertBannerData, setAlertBannerData] =
        useState<AlertBannerData | null>(null)
    const clearAlertBannerData = () => setAlertBannerData(null)

    const { data: agentsDataWithStatus } = useListUsers(
        {
            limit: 100,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
            available_first: isTransferToExternalNumberEnabled
                ? true
                : undefined,
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                enabled: !!isOpen,
            },
        },
    )

    const { mutate: transferCall, isLoading: isRequestingTransfer } =
        useTransferCall({
            mutation: {
                onSuccess: () => {
                    setIsOpen(false)
                    onTransferInitiated(selectedAgent)
                },
                onError: (error) => {
                    const message =
                        get(error, 'response.data.error.msg') ??
                        'Call transfer failed because an error occurred. Please try again.'
                    const isWarning = error.response?.status === 400

                    void dispatch(
                        notify({
                            status: isWarning
                                ? NotificationStatus.Warning
                                : NotificationStatus.Error,
                            message,
                        }),
                    )
                    setAlertBannerData({
                        message: isWarning
                            ? 'Transfer unsuccessful. Please try again.'
                            : 'Transfer failed. Please try again.',
                        type: isWarning ? 'warning' : 'error',
                    })
                },
            },
        })

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

    const handleTransferCallClick = () => {
        if (!selectedAgent) return

        transferCall({
            data: {
                type: VoiceCallTransferType.Cold,
                receiver_type: VoiceCallTransferReceiverType.Agent,
                receiver_id: selectedAgent,
                call_sid: getCallSid(call),
            },
        })
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement={placement}
            className={css.container}
            value={selectedAgent}
        >
            {isTransferToExternalNumberEnabled && (
                <div className={css.toggleContainer}>
                    <ToggleButton.Wrapper
                        type={ToggleButton.Type.Label}
                        value={selectedTransferType}
                        onChange={setSelectedTransferType}
                        size="small"
                        className={css.toggleButtonWrapper}
                    >
                        <ToggleButton.Option value={TransferType.Agents}>
                            Agents
                        </ToggleButton.Option>
                    </ToggleButton.Wrapper>
                </div>
            )}
            <DropdownSearch />
            <DropdownBody
                className={css.dropdownBody}
                onClick={clearAlertBannerData}
            >
                {isTransferToExternalNumberEnabled ? (
                    <>
                        <DropdownSection
                            title={`Available (${availableAgents.length})`}
                            alwaysRender
                        >
                            {availableAgents.map((agent) => (
                                <AgentDropdownItem
                                    key={`agent-${agent.id}`}
                                    agent={agent}
                                    onSelect={setSelectedAgent}
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
                                    onSelect={setSelectedAgent}
                                    isDisabled
                                />
                            ))}
                        </DropdownSection>
                    </>
                ) : (
                    <DropdownSection title="Agents">
                        {mergedAgentData.map((agent) => (
                            <AgentDropdownItem
                                key={`agent-${agent.id}`}
                                agent={agent}
                                onSelect={setSelectedAgent}
                            />
                        ))}
                    </DropdownSection>
                )}
            </DropdownBody>
            <div className={css.dropdownFooter}>
                {isTransferToExternalNumberEnabled && (
                    <DropdownAlertBanner
                        data={alertBannerData}
                        onClear={clearAlertBannerData}
                        autoDismiss
                    />
                )}
                <Button
                    className={css.cta}
                    isDisabled={!selectedAgent}
                    onClick={handleTransferCallClick}
                    isLoading={isRequestingTransfer}
                >
                    Transfer call
                </Button>
            </div>
        </Dropdown>
    )
}

type AgentDropdownItemProps = {
    agent: AgentWithStatus
    onSelect: (agentId: number) => void
    isDisabled?: boolean
}

function AgentDropdownItem({
    agent,
    onSelect,
    isDisabled = false,
}: AgentDropdownItemProps) {
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
