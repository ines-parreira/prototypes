import type { ComponentProps } from 'react'

import { Form } from '@repo/forms'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    mockBranchOptions,
    mockIvrMenuStep,
    mockVoiceMessageTextToSpeech,
} from '@gorgias/helpdesk-mocks'

import { Flow, FlowProvider } from 'core/ui/flows'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { VoiceFlowNodeType } from '../../constants'
import type { VoiceFlowNode } from '../../types'
import { createIvrOptionNode } from '../../utils'
import VoiceFlowProvider from '../../VoiceFlowProvider'
import { IvrMenuNode } from '../IvrMenuNode'

const mockUpdateNodes = jest.fn()
jest.mock(
    'pages/integrations/integration/components/voice/flows/hooks/useUpdateNodes',
    () => ({
        useUpdateNodes: () => mockUpdateNodes,
    }),
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceMessageTTS/VoiceMessageTTSPreviewFields',
    () => () => <div>VoiceMessageTTSPreviewFields</div>,
)

const matchesOriginal = HTMLElement.prototype.matches
HTMLElement.prototype.matches = function (query: string) {
    if (query === ':focus-visible') return false
    return matchesOriginal.call(this, query)
}
HTMLCanvasElement.prototype.getContext = jest.fn()

const ivrMenuStep = mockIvrMenuStep({
    id: '1',
    message: mockVoiceMessageTextToSpeech(),
    branch_options: [
        mockBranchOptions({
            input_digit: '1',
            branch_name: 'branch_name_1',
        }),
        mockBranchOptions({
            input_digit: '2',
            branch_name: 'branch_name_2',
        }),
        mockBranchOptions({
            input_digit: '4',
            branch_name: 'branch_name_4',
        }),
    ],
})

const defaultValues = {
    first_step_id: '1',
    steps: {
        [ivrMenuStep.id]: ivrMenuStep,
    },
}

const nodes: VoiceFlowNode[] = [
    {
        id: ivrMenuStep.id,
        type: VoiceFlowNodeType.IvrMenu,
        data: ivrMenuStep,
        position: { x: 0, y: 0 },
    },
    {
        id: '2',
        type: VoiceFlowNodeType.IvrOption,
        data: {
            parentId: ivrMenuStep.id,
            optionIndex: 0,
            next_step_id: 'intermediary-node-id-1',
        },
        position: { x: 100, y: 100 },
    },
    {
        id: '3',
        type: VoiceFlowNodeType.IvrOption,
        data: {
            parentId: ivrMenuStep.id,
            optionIndex: 1,
            next_step_id: 'intermediary-node-id-2',
        },
        position: { x: 100, y: 200 },
    },
    {
        id: '4',
        type: VoiceFlowNodeType.IvrOption,
        data: {
            parentId: ivrMenuStep.id,
            optionIndex: 2,
            next_step_id: 'intermediary-node-id-3',
        },
        position: { x: 100, y: 300 },
    },
]

const onNodesChange = jest.fn()
const flowProps: ComponentProps<typeof Flow> = {
    nodes,
    nodeTypes: {
        [VoiceFlowNodeType.IvrMenu]: IvrMenuNode,
    },
    onNodesChange,
}

const renderComponent = (
    flowDefaultProps: ComponentProps<typeof Flow> = flowProps,
    formDefaultValues = defaultValues,
) => {
    return renderWithStoreAndQueryClientProvider(
        <FlowProvider>
            <VoiceFlowProvider selectedNode={ivrMenuStep.id}>
                <Form
                    defaultValues={formDefaultValues}
                    onValidSubmit={jest.fn()}
                >
                    <Flow
                        {...flowDefaultProps}
                        nodesDraggable={false}
                        panOnDrag={false}
                    />
                </Form>
            </VoiceFlowProvider>
        </FlowProvider>,
        {},
    )
}

describe('IvrMenuNode', () => {
    it('should render node', () => {
        renderComponent()

        expect(screen.getAllByText('IVR Menu').length).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByText('Greeting message').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByDisplayValue('branch_name_1').length,
        ).toBeGreaterThanOrEqual(1)
        expect(
            screen.getAllByDisplayValue('branch_name_2').length,
        ).toBeGreaterThanOrEqual(1)

        expect(
            screen.queryByText(/This menu is a nested IVR/),
        ).not.toBeInTheDocument()
    })

    it('should handle custom recording type in description', () => {
        const ivrMenuWithCustomRecording = mockIvrMenuStep({
            id: '1',
            message: {
                voice_message_type: 'custom_recording',
                custom_recording_url: 'https://example.com/recording.mp3',
                text_to_speech_content: '',
            } as any,
            branch_options: [
                mockBranchOptions({
                    input_digit: '1',
                    branch_name: 'Option 1',
                }),
                mockBranchOptions({
                    input_digit: '2',
                    branch_name: 'Option 2',
                }),
            ],
        })

        renderComponent(flowProps, {
            first_step_id: '1',
            steps: {
                [ivrMenuWithCustomRecording.id]: ivrMenuWithCustomRecording,
            },
        })

        expect(screen.getByText('Custom recording')).toBeInTheDocument()
    })

    it('should show correct description when text_to_speech_content is empty', () => {
        const ivrMenuWithEmptyMessage = mockIvrMenuStep({
            id: '1',
            message: mockVoiceMessageTextToSpeech({
                text_to_speech_content: '',
            }),
            branch_options: [
                mockBranchOptions({
                    input_digit: '1',
                    branch_name: 'Option 1',
                }),
                mockBranchOptions({
                    input_digit: '2',
                    branch_name: 'Option 2',
                }),
            ],
        })

        renderComponent(flowProps, {
            first_step_id: '1',
            steps: {
                [ivrMenuWithEmptyMessage.id]: ivrMenuWithEmptyMessage,
            },
        })

        expect(screen.getByText('Add greeting message')).toBeInTheDocument()
    })

    it('should add new node to flow when add option button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(screen.getByText('Add option'))
        })

        await waitFor(() => {
            expect(mockUpdateNodes).toHaveBeenCalled()
        })
    })

    describe('node errors', () => {
        it('should show error when greeting message is not set', async () => {
            const user = userEvent.setup()

            renderComponent(flowProps, {
                ...defaultValues,
                steps: {
                    [ivrMenuStep.id]: {
                        ...ivrMenuStep,
                        message: mockVoiceMessageTextToSpeech({
                            text_to_speech_content: '',
                        }),
                    },
                },
            })

            await act(async () => {
                await user.hover(screen.getByLabelText('octagon-error'))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('Greeting message is required'),
                ).toBeInTheDocument()
            })
        })

        it('should show error when branch options are not valid', async () => {
            const user = userEvent.setup()

            renderComponent(flowProps, {
                ...defaultValues,
                steps: {
                    [ivrMenuStep.id]: {
                        ...ivrMenuStep,
                        branch_options: [
                            mockBranchOptions({
                                input_digit: '1',
                                branch_name: null as any,
                            }),
                        ],
                    },
                },
            })

            await act(async () => {
                await user.hover(screen.getByLabelText('octagon-error'))
            })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Menu options are required and cannot point to end call',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    it('should display info banner when nested ivr menu is detected', async () => {
        const parentIvrMenuStep = mockIvrMenuStep({
            id: 'parent-ivr',
            branch_options: [
                mockBranchOptions({
                    input_digit: '1',
                    next_step_id: ivrMenuStep.id,
                }),
            ],
        })
        const parentIvrMenuNode = {
            id: parentIvrMenuStep.id,
            type: VoiceFlowNodeType.IvrMenu,
            data: parentIvrMenuStep,
            position: { x: 0, y: 0 },
        }
        const childIvrMenuStep = mockIvrMenuStep({
            id: 'child-ivr',
            branch_options: [
                mockBranchOptions({
                    input_digit: '1',
                    next_step_id: null as any,
                }),
                mockBranchOptions({
                    input_digit: '2',
                    next_step_id: null as any,
                }),
            ],
        })
        const ivrOptionNode = createIvrOptionNode(
            parentIvrMenuNode as any,
            0,
            'child-ivr',
        )
        const nestedIvrFormValues = {
            first_step_id: parentIvrMenuStep.id,
            steps: {
                [parentIvrMenuStep.id]: parentIvrMenuStep,
                [childIvrMenuStep.id]: childIvrMenuStep,
            },
        }
        const flowProps = {
            nodes: [
                parentIvrMenuNode,
                { ...ivrOptionNode, position: { x: 100, y: 100 } },
                {
                    id: childIvrMenuStep.id,
                    type: VoiceFlowNodeType.IvrMenu,
                    data: childIvrMenuStep,
                    position: { x: 100, y: 100 },
                },
            ],
            nodeTypes: {
                [VoiceFlowNodeType.IvrMenu]: IvrMenuNode,
            },
        }
        const user = userEvent.setup()

        renderComponent(flowProps, nestedIvrFormValues)

        await act(async () => {
            await user.click(screen.getAllByText('IVR Menu')[1])
        })

        await waitFor(() => {
            expect(
                screen.getByText(/This menu is a nested IVR/),
            ).toBeInTheDocument()
        })
    })

    it('should not render node when form value does not exist', () => {
        const step = mockIvrMenuStep()
        const flow = {
            steps: {},
        }

        renderComponent(step, flow as any)

        expect(screen.queryByText('IVR Menu')).not.toBeInTheDocument()
    })
})
