import { assumeMock, render } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { useInterval } from '@gorgias/toolkit-react'

import type { LiveCallQueueAgent } from '@gorgias/helpdesk-queries'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import LiveVoiceAgentRow from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentRow'
import {
    isAgentAvailable,
    isAgentBusy,
    mapBusyAgentStatus,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { getFormattedDurationOngoingCall } from 'models/voiceCall/utils'
import AgentCard from 'pages/common/components/AgentCard/AgentCard'

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useInterval: jest.fn(),
}))
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))
jest.mock('pages/common/components/AgentCard/AgentCard')
jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils.ts')
jest.mock('models/voiceCall/utils')

const defaultAgent = {
    id: 1,
    name: 'John Doe',
}

const useIntervalMock = assumeMock(useInterval)
const AgentCardMock = assumeMock(AgentCard)
const isAgentBusyMock = assumeMock(isAgentBusy)
const getFormattedDurationOngoingCallMock = assumeMock(
    getFormattedDurationOngoingCall,
)
const isAgentAvailableMock = assumeMock(isAgentAvailable)
const mapBusyAgentStatusMock = assumeMock(mapBusyAgentStatus)
const useCustomAgentUnavailableStatusesFlagMock = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)
const successColor = 'var(--feedback-success)'
const errorColor = 'var(--feedback-error)'
const warningColor = 'var(--feedback-warning)'
const infoColor = 'var(--neutral-grey-4)'

describe('LiveVoiceAgentRow', () => {
    const renderComponent = (agent: LiveCallQueueAgent) =>
        render(<LiveVoiceAgentRow agent={agent} />)

    beforeEach(() => {
        AgentCardMock.mockReturnValue(<div>AgentCardMock</div>)
        mapBusyAgentStatusMock.mockReturnValue({
            description: '2021-08-01T09:58:00Z',
            isDescriptionTimestamp: true,
        })
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
    })

    describe('busy agent', () => {
        it('should render correct description when agent is in call', async () => {
            getFormattedDurationOngoingCallMock.mockImplementation(
                (description) => description,
            )
            isAgentBusyMock.mockReturnValue(true)
            mapBusyAgentStatusMock.mockReturnValue({
                description: '2021-08-01T09:58:00Z',
                isDescriptionTimestamp: true,
            })

            renderComponent(defaultAgent)

            act(() => {
                useIntervalMock.mock.lastCall?.[0]()
            })

            await waitFor(() => {
                expect(AgentCardMock).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        description: '2021-08-01T09:58:00Z',
                        badgeColor: warningColor,
                    }),
                    {},
                )
            })
        })
    })

    describe('available agent', () => {
        it('should render correct description when agent is available and online', () => {
            isAgentBusyMock.mockReturnValue(false)
            isAgentAvailableMock.mockReturnValue(true)

            const agent = {
                ...defaultAgent,
                is_available_for_call: true,
                online: true,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: successColor,
                }),
                {},
            )
        })

        it('should render correct description when agent is available and offline', () => {
            isAgentBusyMock.mockReturnValue(false)
            isAgentAvailableMock.mockReturnValue(true)

            const agent = {
                ...defaultAgent,
                is_available_for_call: true,
                online: false,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    description: 'Available while offline',
                    badgeColor: infoColor,
                }),
                {},
            )
        })

        it('should display forward icon when agent has forwarding enabled and forward when offline is enabled', () => {
            const agent = {
                ...defaultAgent,
                is_available_for_call: true,
                online: false,
                forward_calls: true,
                forward_when_offline: true,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: infoColor,
                }),
                {},
            )
        })

        it('should not display forward icon when agent has forwarding enabled but forward when offline is disabled', () => {
            const agent = {
                ...defaultAgent,
                is_available_for_call: true,
                online: false,
                forward_calls: true,
                forward_when_offline: false,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: infoColor,
                }),
                {},
            )
        })

        it('should not display forward icon when agent has forwarding disabled', () => {
            const agent = {
                ...defaultAgent,
                is_available_for_call: true,
                online: false,
                forward_calls: false,
                forward_when_offline: true,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: infoColor,
                }),
                {},
            )
        })
    })

    describe('unavailable agent', () => {
        it('should render correct description when agent is unavailable and online', () => {
            isAgentBusyMock.mockReturnValue(false)
            isAgentAvailableMock.mockReturnValue(false)

            const agent = {
                ...defaultAgent,
                is_available_for_call: false,
                online: true,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: errorColor,
                }),
                {},
            )
        })

        it('should render correct description when agent is unavailable and offline', () => {
            isAgentBusyMock.mockReturnValue(false)
            isAgentAvailableMock.mockReturnValue(false)

            const agent = {
                ...defaultAgent,
                is_available_for_call: false,
                online: false,
            }

            renderComponent(agent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    badgeColor: infoColor,
                }),
                {},
            )
        })
    })

    describe('when isCustomUnavailabilityEnabled flag is on', () => {
        beforeEach(() => {
            useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        })

        it('passes the agent id and opts out of the legacy avatar', () => {
            renderComponent(defaultAgent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    userId: defaultAgent.id,
                    useLegacyAvatar: false,
                }),
                {},
            )
        })
    })

    describe('when isCustomUnavailabilityEnabled flag is off', () => {
        it('keeps the legacy avatar on AgentCard', () => {
            renderComponent(defaultAgent)

            expect(AgentCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    userId: defaultAgent.id,
                    useLegacyAvatar: true,
                }),
                {},
            )
        })
    })
})
