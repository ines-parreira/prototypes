import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import {produce} from 'immer'
import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {areGraphsEqual} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionsPlatformTemplateVisualBuilderView from '../ActionsPlatformTemplateVisualBuilderView'

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock(
    'pages/automate/workflows/models/visualBuilderGraph.model',
    () =>
        ({
            ...jest.requireActual(
                'pages/automate/workflows/models/visualBuilderGraph.model'
            ),
            areGraphsEqual: jest.fn(),
        }) as Record<string, unknown>
)

const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockAreGraphsEqual = jest.mocked(areGraphsEqual)

mockUseAppDispatch.mockReturnValue(jest.fn())
mockAreGraphsEqual.mockReturnValue(true)

const queryClient = mockQueryClient()

describe('<ActionsPlatformTemplateVisualBuilderView />', () => {
    it('should render fallback action name', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph: produce(
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                            (draft) => {
                                draft.name = ''
                            }
                        ),
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: jest.fn(),
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={jest.fn()}
                        handleTouch={jest.fn()}
                        onExit={jest.fn()}
                        onSave={jest.fn()}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        expect(screen.getByDisplayValue('Untitled Action')).toBeInTheDocument()
    })

    it('should try to save with errors', () => {
        mockAreGraphsEqual.mockReturnValue(false)

        const mockHandleValidate = jest
            .fn()
            .mockImplementation((graph: VisualBuilderGraph) =>
                produce(graph, (draft) => {
                    draft.errors ??= {}
                    draft.errors.nodes = 'Error'
                })
            )

        const mockDispatch = jest.fn()
        const mockOnSave = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: mockDispatch,
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={mockHandleValidate}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={jest.fn()}
                        onSave={mockOnSave}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'RESET_GRAPH',
            })
        )
        expect(notify).toHaveBeenCalledWith({
            message: 'Complete or delete incomplete steps in order to save',
            status: NotificationStatus.Error,
        })
        expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should save without errors', () => {
        mockAreGraphsEqual.mockReturnValue(false)

        const mockOnSave = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: jest.fn(),
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={jest.fn()}
                        onSave={mockOnSave}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'Successfully updated Action',
            status: NotificationStatus.Success,
        })
        expect(mockOnSave).toHaveBeenCalled()
    })

    it('should open unsaved changes modal', () => {
        const mockOnSave = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: jest.fn(),
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={jest.fn()}
                        onSave={mockOnSave}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.'
            )
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(notify).toHaveBeenCalledWith({
            message: 'Successfully updated Action',
            status: NotificationStatus.Success,
        })
        expect(mockOnSave).toHaveBeenCalled()
    })

    it('should exit if there are no unsaved changes', () => {
        mockAreGraphsEqual.mockReturnValue(true)

        const mockDispatch = jest.fn()
        const mockOnExit = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: mockDispatch,
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={mockOnExit}
                        onSave={jest.fn()}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnExit).toHaveBeenCalled()
    })

    it('should discard changes', () => {
        mockAreGraphsEqual.mockReturnValue(false)

        const mockDispatch = jest.fn()
        const mockOnExit = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: mockDispatch,
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={mockOnExit}
                        onSave={jest.fn()}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.'
            )
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Discard Changes'))
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'RESET_GRAPH',
            })
        )
        expect(mockOnExit).toHaveBeenCalled()
    })

    it('should open unsaved changes modal & trigger errors on save', () => {
        mockAreGraphsEqual.mockReturnValue(false)

        const mockHandleValidate = jest
            .fn()
            .mockImplementation((graph: VisualBuilderGraph) =>
                produce(graph, (draft) => {
                    draft.errors ??= {}
                    draft.errors.nodes = 'Error'
                })
            )

        const mockDispatch = jest.fn()
        const mockOnSave = jest.fn()

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <VisualBuilderContext.Provider
                    value={{
                        visualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        checkNodeHasVariablesUsedInChildren: jest.fn(),
                        dispatch: mockDispatch,
                        getVariableListInChildren: jest.fn(),
                        getVariableListForNode: jest.fn(),
                        checkNewVisualBuilderNode: jest.fn(),
                        initialVisualBuilderGraph:
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
                        isNew: false,
                    }}
                >
                    <ActionsPlatformTemplateVisualBuilderView
                        visualBuilderGraph={
                            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture
                        }
                        handleValidate={mockHandleValidate}
                        handleTouch={jest
                            .fn()
                            .mockImplementation(
                                (graph: VisualBuilderGraph) => graph
                            )}
                        onExit={jest.fn()}
                        onSave={mockOnSave}
                    />
                </VisualBuilderContext.Provider>
            </QueryClientProvider>
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.'
            )
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'RESET_GRAPH',
            })
        )
        expect(notify).toHaveBeenCalledWith({
            message: 'Complete or delete incomplete steps in order to save',
            status: NotificationStatus.Error,
        })
        expect(mockOnSave).not.toHaveBeenCalled()
    })
})
