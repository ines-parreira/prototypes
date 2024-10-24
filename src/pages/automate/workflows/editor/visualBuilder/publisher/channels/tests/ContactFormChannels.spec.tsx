import {render} from '@testing-library/react'
import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'

import ChannelBlock from '../../helper/ChannelBlock'
import useOnlySupportedChannels from '../../helper/useOnlySupportedChannels'
import ChannelToggle from '../ChannelToggle'
import ContactFormChannels from '../ContactFormChannels'

// Mock the necessary hooks and components
jest.mock(
    'pages/automate/common/hooks/useContactFormsAutomationSettings',
    () => ({
        __esModule: true,
        default: jest.fn(),
        useContactFormsAutomationSettings: jest.fn(),
    })
)
jest.mock('../../helper/useOnlySupportedChannels', () => jest.fn())
jest.mock('../ChannelToggle', () => jest.fn(() => <div>ChannelToggle</div>))
jest.mock('../../helper/ChannelBlock', () =>
    jest.fn(({children}) => <div>{children}</div>)
)

const defaultSelfServiceStandaloneContactFormChannel = {
    type: TicketChannel.ContactForm,
    value: {
        id: 1,
        name: 'Default Contact Form',
    },
} as unknown as SelfServiceStandaloneContactFormChannel

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

describe('ContactFormChannels', () => {
    beforeEach(() => {
        ;(useOnlySupportedChannels as jest.Mock).mockReturnValue([])
        ;(useContactFormsAutomationSettings as jest.Mock).mockReturnValue({
            contactFormsAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })
    })

    it('renders the ContactFormChannels component with ChannelBlock', () => {
        render(
            <ContactFormChannels
                configuration={workflowConfiguration}
                standaloneContactFormsChannels={[
                    defaultSelfServiceStandaloneContactFormChannel,
                ]}
            />
        )

        expect(ChannelBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                channelType: TicketChannel.ContactForm,
            }),
            expect.anything()
        )
    })

    it('renders ChannelItem for each valid standalone contact form channel', () => {
        render(
            <ContactFormChannels
                configuration={workflowConfiguration}
                standaloneContactFormsChannels={[
                    defaultSelfServiceStandaloneContactFormChannel,
                ]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                configuration: workflowConfiguration,
                channel: defaultSelfServiceStandaloneContactFormChannel,
                isLoading: false,
                workflows: [{id: 'workflow-1', enabled: true}],
            }),
            expect.anything()
        )
    })

    it('passes correct props to ChannelToggle', () => {
        const handleContactFormAutomationSettingsUpdate = jest.fn()

        ;(useContactFormsAutomationSettings as jest.Mock).mockReturnValue({
            contactFormsAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate,
        })

        render(
            <ContactFormChannels
                configuration={workflowConfiguration}
                standaloneContactFormsChannels={[
                    defaultSelfServiceStandaloneContactFormChannel,
                ]}
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
        ;(useContactFormsAutomationSettings as jest.Mock).mockReturnValue({
            contactFormsAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
            },
            isUpdatePending: true,
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <ContactFormChannels
                configuration={workflowConfiguration}
                standaloneContactFormsChannels={[
                    defaultSelfServiceStandaloneContactFormChannel,
                ]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            expect.anything()
        )
    })

    it('handles multiple standalone contact form channels correctly', () => {
        const anotherContactFormChannel = {
            ...defaultSelfServiceStandaloneContactFormChannel,
            value: {
                ...defaultSelfServiceStandaloneContactFormChannel.value,
                id: 2,
            },
        } as unknown as SelfServiceStandaloneContactFormChannel

        ;(useContactFormsAutomationSettings as jest.Mock).mockReturnValue({
            contactFormsAutomationSettings: {
                1: {
                    workflows: [{id: 'workflow-1', enabled: true}],
                },
                2: {
                    workflows: [{id: 'workflow-2', enabled: false}],
                },
            },
            isUpdatePending: false,
            isFetchPending: false,
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        render(
            <ContactFormChannels
                configuration={workflowConfiguration}
                standaloneContactFormsChannels={[
                    defaultSelfServiceStandaloneContactFormChannel,
                    anotherContactFormChannel,
                ]}
            />
        )

        expect(ChannelToggle).toHaveBeenCalledTimes(2)
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: defaultSelfServiceStandaloneContactFormChannel,
                workflows: [{id: 'workflow-1', enabled: true}],
            }),
            expect.anything()
        )
        expect(ChannelToggle).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: anotherContactFormChannel,
                workflows: [{id: 'workflow-2', enabled: false}],
            }),
            expect.anything()
        )
    })
})
