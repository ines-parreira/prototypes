import React from 'react'

import { render, screen } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'

import useLanguagesMismatchWarnings from '../../../workflows/hooks/useLanguagesMismatchWarnings'
import { WorkflowChannelSupportContext } from '../../../workflows/hooks/useWorkflowChannelSupport'
import WorkflowItem from '../WorkflowItem'
import type { Entrypoint } from '../WorkflowsFeatureList'
import WorkflowsFeatureList from '../WorkflowsFeatureList'

jest.mock('../../../workflows/hooks/useLanguagesMismatchWarnings', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('../WorkflowItem', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="workflow-item">WorkflowItem</div>),
}))

const mockGetUnsupportedNodeTypes = jest.fn().mockReturnValue([])
const mockGetSupportedChannels = jest.fn().mockReturnValue([])
const mockGetLanguagesMismatchWarning = jest.fn().mockReturnValue(null)

describe('WorkflowsFeatureList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useLanguagesMismatchWarnings as jest.Mock).mockReturnValue({
            getLanguagesMismatchWarning: mockGetLanguagesMismatchWarning,
        })
        ;(WorkflowItem as jest.Mock).mockImplementation(
            ({ isToggleable, toggleTooltipMessage }) => (
                <div data-testid="workflow-item">
                    <div data-testid="is-toggleable">
                        {String(isToggleable)}
                    </div>
                    <div data-testid="toggle-tooltip">
                        {toggleTooltipMessage || 'no-tooltip'}
                    </div>
                </div>
            ),
        )
    })

    it('should correctly set isLimitReached when max active workflows is reached', () => {
        const entrypoints: Entrypoint[] = [
            { workflow_id: '1', enabled: true },
            { workflow_id: '2', enabled: true },
            { workflow_id: '3', enabled: false },
        ]

        const limitTooltipMessage = 'Max limit reached'

        const mockContext = {
            getUnsupportedNodeTypes: mockGetUnsupportedNodeTypes,
            getSupportedChannels: mockGetSupportedChannels,
            isStepUnsupportedInAllChannels: jest.fn().mockReturnValue(false),
            getUnsupportedConnectedChannels: jest.fn().mockReturnValue([]),
            getUnsupportedChannels: jest.fn().mockReturnValue([]),
        }

        render(
            <WorkflowChannelSupportContext.Provider value={mockContext}>
                <WorkflowsFeatureList
                    channelType={TicketChannel.Chat}
                    channelId="test-channel"
                    integrationId={1}
                    channelLanguages={[]}
                    entrypoints={entrypoints}
                    onChange={jest.fn()}
                    maxActiveWorkflows={2}
                    limitTooltipMessage={limitTooltipMessage}
                    configurations={
                        [
                            {
                                id: '1',
                                internal_id: '1',
                                name: 'Workflow 1',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-1',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                            {
                                id: '2',
                                internal_id: '2',
                                name: 'Workflow 2',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-2',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                            {
                                id: '3',
                                internal_id: '3',
                                name: 'Workflow 3',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-3',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                        ] as any
                    }
                    allEntrypoints={[
                        { workflow_id: '1' },
                        { workflow_id: '2' },
                        { workflow_id: '3' },
                    ]}
                />
            </WorkflowChannelSupportContext.Provider>,
        )

        const workflowItems = screen.getAllByTestId('workflow-item')
        expect(workflowItems).toHaveLength(3)

        expect(screen.getAllByTestId('is-toggleable')[0].textContent).toBe(
            'true',
        )
        expect(screen.getAllByTestId('is-toggleable')[1].textContent).toBe(
            'true',
        )
        expect(screen.getAllByTestId('is-toggleable')[2].textContent).toBe(
            'false',
        )
        expect(screen.getAllByTestId('toggle-tooltip')[2].textContent).toBe(
            limitTooltipMessage,
        )
    })

    it('should not set isLimitReached when under max active workflows', () => {
        const entrypoints: Entrypoint[] = [
            { workflow_id: '1', enabled: true },
            { workflow_id: '2', enabled: true },
            { workflow_id: '3', enabled: false },
        ]

        const mockContext = {
            getUnsupportedNodeTypes: mockGetUnsupportedNodeTypes,
            getSupportedChannels: mockGetSupportedChannels,
            isStepUnsupportedInAllChannels: jest.fn().mockReturnValue(false),
            getUnsupportedConnectedChannels: jest.fn().mockReturnValue([]),
            getUnsupportedChannels: jest.fn().mockReturnValue([]),
        }

        render(
            <WorkflowChannelSupportContext.Provider value={mockContext}>
                <WorkflowsFeatureList
                    channelType={TicketChannel.Chat}
                    channelId="test-channel"
                    integrationId={1}
                    channelLanguages={[]}
                    entrypoints={entrypoints}
                    onChange={jest.fn()}
                    maxActiveWorkflows={3}
                    limitTooltipMessage="Max limit reached"
                    configurations={
                        [
                            {
                                id: '1',
                                internal_id: '1',
                                name: 'Workflow 1',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-1',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                            {
                                id: '2',
                                internal_id: '2',
                                name: 'Workflow 2',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-2',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                            {
                                id: '3',
                                internal_id: '3',
                                name: 'Workflow 3',
                                account_id: 1,
                                is_draft: false,
                                initial_step_id: 'step-3',
                                steps: [],
                                transitions: [],
                                available_languages: [],
                            },
                        ] as any
                    }
                    allEntrypoints={[
                        { workflow_id: '1' },
                        { workflow_id: '2' },
                        { workflow_id: '3' },
                    ]}
                />
            </WorkflowChannelSupportContext.Provider>,
        )

        const toggleableElements = screen.getAllByTestId('is-toggleable')
        expect(toggleableElements).toHaveLength(3)
        expect(toggleableElements[0].textContent).toBe('true')
        expect(toggleableElements[1].textContent).toBe('true')
        expect(toggleableElements[2].textContent).toBe('true')

        expect(screen.getAllByTestId('toggle-tooltip')[2].textContent).toBe(
            'no-tooltip',
        )
    })
})
