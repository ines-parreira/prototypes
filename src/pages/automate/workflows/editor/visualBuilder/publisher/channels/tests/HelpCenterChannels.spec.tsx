import React from 'react'
import {render} from '@testing-library/react'
import {TicketChannel} from 'business/types/ticket'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {SelfServiceHelpCenterChannel} from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import ChannelBlock from '../../helper/ChannelBlock'
import useOnlySupportedChannels from '../../helper/useOnlySupportedChannels'
import ChannelToggle from '../ChannelToggle'
import HelpCenterChannels from '../HelpCenterChannels'

// Mock the necessary hooks and components
jest.mock(
    'pages/automate/common/hooks/useHelpCentersAutomationSettings',
    () => ({
        __esModule: true,
        default: jest.fn(),
        useHelpCentersAutomationSettings: jest.fn(),
    })
)
jest.mock('../../helper/useOnlySupportedChannels', () => jest.fn())
jest.mock('../ChannelToggle', () => jest.fn(() => <div>ChannelToggle</div>))
jest.mock('../../helper/ChannelBlock', () =>
    jest.fn(({children}) => <div>{children}</div>)
)

const defaultSelfServiceHelpCenterChannel = {
    type: TicketChannel.HelpCenter,
    value: {
        id: 1,
        name: 'Default Help Center',
        supported_locales: ['en-US'],
    },
} as unknown as SelfServiceHelpCenterChannel

const workflowConfiguration = {
    id: 'workflow-1',
    internal_id: 'internal-workflow-1',
    account_id: 1,
    is_draft: true,
    name: 'Default Workflow',
    initial_step_id: 'message-step-1',
    updated_datetime: '2024-01-01T00:00:00Z',
    steps: [],
    transitions: [],
    available_languages: ['en-US'],
} as WorkflowConfiguration

describe('HelpCenterChannels', () => {
    beforeEach(() => {
        ;(useOnlySupportedChannels as jest.Mock).mockReturnValue([])
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            helpCentersAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('renders the HelpCenterChannels component with ChannelBlock', () => {
        render(
            <HelpCenterChannels
                configuration={workflowConfiguration}
                helpCentersChannels={[defaultSelfServiceHelpCenterChannel]}
            />
        )

        expect(ChannelBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                channelType: TicketChannel.HelpCenter,
            }),
            expect.anything()
        )
    })

    it('renders ChannelItem for each valid help center channel', () => {
        render(
            <HelpCenterChannels
                configuration={workflowConfiguration}
                helpCentersChannels={[defaultSelfServiceHelpCenterChannel]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                configuration: workflowConfiguration,
                channel: defaultSelfServiceHelpCenterChannel,
                isLoading: false,
                workflows: [{id: 'workflow-1', enabled: true}],
            }),
            expect.anything()
        )
    })

    it('passes correct props to ChannelToggle', () => {
        const handleHelpCenterAutomationSettingsUpdate = jest.fn()

        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            helpCentersAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleHelpCenterAutomationSettingsUpdate,
        })

        render(
            <HelpCenterChannels
                configuration={workflowConfiguration}
                helpCentersChannels={[defaultSelfServiceHelpCenterChannel]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                handleAutomationSettingUpdate: expect.any(Function),
                workflows: [{id: 'workflow-1', enabled: true}],
                isLoading: false,
                onlySupportedChannels: [],
            }),
            expect.anything()
        )
    })

    it('disables ChannelToggle when isLoading is true', () => {
        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            helpCentersAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: true,
            isFetchPending: false,
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <HelpCenterChannels
                configuration={workflowConfiguration}
                helpCentersChannels={[defaultSelfServiceHelpCenterChannel]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            expect.anything()
        )
    })

    it('handles multiple help center channels correctly', () => {
        const anotherHelpCenterChannel = {
            ...defaultSelfServiceHelpCenterChannel,
            value: {
                ...defaultSelfServiceHelpCenterChannel.value,
                id: 2,
            },
        } as unknown as SelfServiceHelpCenterChannel

        ;(useHelpCentersAutomationSettings as jest.Mock).mockReturnValue({
            helpCentersAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
                2: {
                    workflows: [{id: 'workflow-2', enabled: false}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleHelpCenterAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <HelpCenterChannels
                configuration={workflowConfiguration}
                helpCentersChannels={[
                    defaultSelfServiceHelpCenterChannel,
                    anotherHelpCenterChannel,
                ]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledTimes(2)
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: defaultSelfServiceHelpCenterChannel,
                workflows: [{id: 'workflow-1', enabled: true}],
            }),
            expect.anything()
        )
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: anotherHelpCenterChannel,
                workflows: [{id: 'workflow-2', enabled: false}],
            }),
            expect.anything()
        )
    })
})
