import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { produce } from 'immer'

import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import ActionFormView from '../ActionFormView'

jest.mock('pages/aiAgent/actions/providers/GuidanceReferenceContext', () => {
    return {
        useGuidanceReferenceContext: () => ({
            canBeDeleted: () => true,
            references: {},
        }),
    }
})
jest.mock('react-router-dom', () => {
    return {
        useParams: () => ({
            shopName: 'test-store',
            shopType: 'shopify' as const,
        }),
    } as unknown as any
})

jest.mock(
    'pages/automate/actionsPlatform/components/ActionsPlatformTemplateSteps',
    () => ({
        __esModule: true,
        default: () => <></>,
    }),
)

describe('<ActionFormView />', () => {
    it('should dispatch SET_NAME action on name change', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.change(screen.getAllByRole('textbox')[0], {
                target: { value: 'some name' },
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_NAME',
            name: 'some name',
        })
    })

    it('should dispatch SET_TOUCHED action on name blur', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.blur(screen.getAllByRole('textbox')[0])
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TOUCHED',
            touched: {
                name: true,
            },
        })
    })

    it('should dispatch SET_NAME action on description change', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.change(screen.getAllByRole('textbox')[1], {
                target: { value: 'some description' },
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
            instructions: 'some description',
        })
    })

    it('should dispatch SET_TOUCHED action on description blur', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.blur(screen.getAllByRole('textbox')[1])
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TOUCHED',
            nodeId: 'trigger',
            touched: {
                instructions: true,
            },
        })
    })

    it('should dispatch DELETE_LLM_PROMPT_TRIGGER_CONDITION action', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: produce(
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        (draft) => {
                            draft.nodes[0].data.conditionsType = 'and'
                            draft.nodes[0].data.conditions = [
                                {
                                    equals: [
                                        { var: 'objects.customer.firstname' },
                                        'test',
                                    ],
                                },
                            ]
                        },
                    ),
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [
                        {
                            name: 'Customer first name',
                            value: 'objects.customer.firstname',
                            nodeType: 'shopper_authentication',
                            type: 'string',
                        },
                    ],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('clear'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'DELETE_LLM_PROMPT_TRIGGER_CONDITION',
            index: 0,
        })
    })

    it('should dispatch ADD_LLM_PROMPT_TRIGGER_CONDITION action', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: produce(
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        (draft) => {
                            draft.nodes[0].data.conditionsType = 'and'
                        },
                    ),
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [
                        {
                            name: 'Customer first name',
                            value: 'objects.customer.firstname',
                            nodeType: 'shopper_authentication',
                            type: 'string',
                        },
                    ],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Add Condition'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Customer first name'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'ADD_LLM_PROMPT_TRIGGER_CONDITION',
            condition: {
                equals: [{ var: 'objects.customer.firstname' }, undefined],
            },
        })
    })

    it('should dispatch SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE action', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('At least 1 condition met'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
            conditionsType: 'or',
        })
    })

    it('should dispatch SET_LLM_PROMPT_TRIGGER_CONDITION action', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: produce(
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        (draft) => {
                            draft.nodes[0].data.conditionsType = 'and'
                            draft.nodes[0].data.conditions = [
                                {
                                    equals: [
                                        { var: 'objects.customer.firstname' },
                                        'test',
                                    ],
                                },
                            ]
                        },
                    ),
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [
                        {
                            name: 'Customer first name',
                            value: 'objects.customer.firstname',
                            nodeType: 'shopper_authentication',
                            type: 'string',
                        },
                    ],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test'), {
                target: { value: 'some test' },
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_LLM_PROMPT_TRIGGER_CONDITION',
            index: 0,
            condition: {
                equals: [{ var: 'objects.customer.firstname' }, 'some test'],
            },
        })
    })

    it('should dispatch SET_TOUCHED action on condition blur', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: produce(
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        (draft) => {
                            draft.nodes[0].data.conditionsType = 'and'
                            draft.nodes[0].data.conditions = [
                                {
                                    equals: [
                                        { var: 'objects.customer.firstname' },
                                        'test',
                                    ],
                                },
                            ]
                        },
                    ),
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [
                        {
                            name: 'Customer first name',
                            value: 'objects.customer.firstname',
                            nodeType: 'shopper_authentication',
                            type: 'string',
                        },
                    ],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test'))
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TOUCHED',
            nodeId: 'trigger',
            touched: {
                conditions: {
                    0: true,
                },
            },
        })
    })

    it('should dispatch SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION action', () => {
        const mockDispatch = jest.fn()

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(
                screen.getByText(
                    'Require customer confirmation to perform Action',
                ),
            )
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
            requiresConfirmation: true,
        })
    })

    it('should dispatch SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME action', () => {
        const mockDispatch = jest.fn()

        const { rerender } = renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable Action'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(1, {
            type: 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME',
            deactivated_datetime: expect.any(String),
        })

        rerender(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: produce(
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        (draft) => {
                            draft.nodes[0].data.deactivated_datetime =
                                new Date().toISOString()
                        },
                    ),
                    initialVisualBuilderGraph:
                        visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView onEditSteps={jest.fn()} steps={[]} />
            </VisualBuilderContext.Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Enable Action'))
        })

        expect(mockDispatch).toHaveBeenNthCalledWith(2, {
            type: 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME',
            deactivated_datetime: null,
        })
    })

    it('should open the modal on requires confirmation change', async () => {
        const user = userEvent.setup()
        const mockDispatch = jest.fn()
        const graph = {
            ...visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
        }
        graph.nodes[0].data.requires_confirmation = true

        renderWithQueryClientProvider(
            <VisualBuilderContext.Provider
                value={{
                    visualBuilderGraph: graph,
                    initialVisualBuilderGraph: graph,
                    checkNodeHasVariablesUsedInChildren: () => false,
                    dispatch: mockDispatch,
                    getVariableListInChildren: () => [],
                    checkNewVisualBuilderNode: () => false,
                    getVariableListForNode: () => [],
                    isNew: false,
                }}
            >
                <ActionFormView
                    onEditSteps={jest.fn()}
                    steps={[
                        {
                            id: 'reusable_llm_prompt_call1',
                            name: 'Step 1',
                            internal_id: '',
                            is_draft: false,
                            initial_step_id: '',
                            steps: [],
                            transitions: [],
                            available_languages: [],
                            created_datetime: '',
                            updated_datetime: '',
                            triggers: [],
                            entrypoints: [
                                {
                                    trigger: 'reusable-llm-prompt',
                                    kind: 'reusable-llm-prompt-call-step',
                                    settings: {
                                        requires_confirmation: true,
                                    },
                                },
                            ],
                            apps: [],
                        },
                    ]}
                />
            </VisualBuilderContext.Provider>,
        )

        const confirmationCheckbox: HTMLInputElement =
            await screen.findByLabelText(
                'Require customer confirmation to perform Action',
            )
        expect(confirmationCheckbox.checked).toBe(true)
        act(() => {
            user.click(confirmationCheckbox)
        })

        let modalHeader = await screen.findByText(
            'Disable confirmation requirement?',
        )

        expect(modalHeader).toBeInTheDocument()

        act(() => {
            user.click(screen.getByText('Back To Editing'))
        })
        await waitFor(() => {
            expect(confirmationCheckbox.checked).toBe(true)
        })

        act(() => {
            user.click(confirmationCheckbox)
        })

        modalHeader = await screen.findByText(
            'Disable confirmation requirement?',
        )
        expect(modalHeader).toBeInTheDocument()

        act(() => {
            const button = screen.getByRole('button', {
                name: 'Disable Confirmation Requirement',
            })
            expect(button).toBeInTheDocument()
            user.click(button)
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Disable confirmation requirement?'),
            ).not.toBeInTheDocument()
        })
    })
})
