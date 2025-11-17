import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockEnqueueStep } from '@gorgias/helpdesk-mocks'

import { Form, useFormContext } from 'core/forms'
import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { VoiceFlowNodeType } from '../constants'
import { RouteToStepTypeField } from '../RouteToStepTypeField'
import type { VoiceFlowFormValues } from '../types'
import { useDeleteNode } from '../utils/useDeleteNode'

jest.mock('core/forms', () => ({
    ...jest.requireActual('core/forms'),
    useFormContext: jest.fn(),
}))

jest.mock('../utils/useDeleteNode')

jest.mock('pages/common/forms/PreviewRadioFieldSet', () =>
    jest.fn(({ onChange, ...props }) => (
        <div data-testid="preview-radio-fieldset">
            <button
                data-testid="route-to-internal-number"
                onClick={() =>
                    onChange?.(VoiceFlowNodeType.RouteToInternalNumber)
                }
            >
                Route to Internal Number
            </button>
            <button
                data-testid="enqueue"
                onClick={() => onChange?.(VoiceFlowNodeType.Enqueue)}
            >
                Enqueue
            </button>
            <div data-testid="fieldset-props">{JSON.stringify(props)}</div>
        </div>
    )),
)

const useFormContextMock = assumeMock(useFormContext)
const useDeleteNodeMock = assumeMock(useDeleteNode)

const mockSetValue = jest.fn()
const mockWatch = jest.fn()
const mockUnregister = jest.fn()
const mockDeleteEnqueueBranches = jest.fn()
const mockOnChange = jest.fn()

const defaultFormValues: VoiceFlowFormValues = {
    first_step_id: 'test-step',
    steps: {
        'test-step': mockEnqueueStep({
            id: 'test-step',
        }),
    },
}

type RouteToStepTypeFieldProps = ComponentProps<typeof RouteToStepTypeField>

const renderComponent = (
    props: Partial<RouteToStepTypeFieldProps> = {},
    formValues: Partial<VoiceFlowFormValues> = {},
) => {
    const mockStep = {
        ...defaultFormValues.steps['test-step'],
        ...formValues.steps?.['test-step'],
    }

    useFormContextMock.mockReturnValue({
        setValue: mockSetValue,
        watch: mockWatch,
        unregister: mockUnregister,
    } as unknown as ReturnType<typeof useFormContext>)

    useDeleteNodeMock.mockReturnValue({
        deleteEnqueueBranches: mockDeleteEnqueueBranches,
    } as unknown as ReturnType<typeof useDeleteNode>)

    mockWatch.mockImplementation((path?: string) => {
        if (path === 'steps.test-step') {
            return mockStep
        }
        return defaultFormValues
    })

    const defaultProps: RouteToStepTypeFieldProps = {
        id: 'test-step',
        onChange: mockOnChange,
        options: [
            { label: 'Queue', value: VoiceFlowNodeType.Enqueue },
            {
                label: 'Voice integration',
                value: VoiceFlowNodeType.RouteToInternalNumber,
            },
        ],
        value: null,
        ...props,
    }

    return act(() => {
        return renderWithStoreAndQueryClientProvider(
            <Form defaultValues={defaultFormValues} onValidSubmit={jest.fn()}>
                <RouteToStepTypeField {...defaultProps} />
            </Form>,
        )
    })
}

describe('RouteToStepTypeField', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render PreviewRadioFieldSet with correct props', () => {
        renderComponent({ value: 'test-value' })

        expect(screen.getByTestId('preview-radio-fieldset')).toBeInTheDocument()

        const propsElement = screen.getByTestId('fieldset-props')
        const props = JSON.parse(propsElement.textContent || '{}')

        expect(props).toEqual(
            expect.objectContaining({
                value: 'test-value',
            }),
        )
    })

    describe('when changing to RouteToInternalNumber', () => {
        describe('without existing enqueue branches', () => {
            it('should unregister form fields and call onChange', async () => {
                const user = userEvent.setup()
                const mockStep = mockEnqueueStep({
                    id: 'test-step',
                    conditional_routing: false,
                })

                renderComponent({}, { steps: { 'test-step': mockStep } })

                await user.click(screen.getByTestId('route-to-internal-number'))

                expect(mockUnregister).toHaveBeenCalledWith(
                    'steps.test-step.conditional_routing',
                )
                expect(mockUnregister).toHaveBeenCalledWith(
                    'steps.test-step.callback_requests',
                )
                expect(mockUnregister).toHaveBeenCalledWith(
                    'steps.test-step.queue_id',
                )
                expect(mockOnChange).toHaveBeenCalledWith(
                    VoiceFlowNodeType.RouteToInternalNumber,
                )
                expect(mockDeleteEnqueueBranches).not.toHaveBeenCalled()
            })
        })

        describe('with existing enqueue branches', () => {
            it('should delete enqueue branches and disable conditional routing', async () => {
                const user = userEvent.setup()
                const mockStep = mockEnqueueStep({
                    id: 'test-step',
                    conditional_routing: true,
                })

                renderComponent({}, { steps: { 'test-step': mockStep } })

                await user.click(screen.getByTestId('route-to-internal-number'))

                expect(mockSetValue).toHaveBeenCalledWith(
                    'steps.test-step.conditional_routing',
                    false,
                    { shouldDirty: true },
                )
                expect(mockDeleteEnqueueBranches).toHaveBeenCalledWith(
                    'test-step',
                )

                // onChange should be called after timeout
                await waitFor(() => {
                    expect(mockOnChange).toHaveBeenCalledWith(
                        VoiceFlowNodeType.RouteToInternalNumber,
                    )
                })
            })
        })
    })

    describe('when changing to Enqueue', () => {
        it('should set callback requests and unregister integration_id', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByTestId('enqueue'))

            expect(mockSetValue).toHaveBeenCalledWith(
                'steps.test-step.callback_requests',
                DEFAULT_CALLBACK_REQUESTS,
            )
            expect(mockUnregister).toHaveBeenCalledWith(
                'steps.test-step.integration_id',
            )
            expect(mockOnChange).toHaveBeenCalledWith(VoiceFlowNodeType.Enqueue)
        })
    })

    describe('onChange integration', () => {
        it('should call onChange', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByTestId('enqueue'))

            expect(mockOnChange).toHaveBeenCalledWith(VoiceFlowNodeType.Enqueue)
        })
    })

    describe('form context integration', () => {
        it('should watch the correct step path', () => {
            renderComponent({ id: 'custom-step' })

            expect(mockWatch).toHaveBeenCalledWith('steps.custom-step')
        })

        it('should use form context hooks correctly', () => {
            renderComponent()

            expect(useFormContextMock).toHaveBeenCalled()
            expect(useDeleteNodeMock).toHaveBeenCalled()
        })
    })

    describe('timeout behavior', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should delay onChange call when deleting enqueue branches', async () => {
            const mockStep = mockEnqueueStep({
                id: 'test-step',
                conditional_routing: true,
            })

            renderComponent({}, { steps: { 'test-step': mockStep } })

            act(() => {
                screen.getByTestId('route-to-internal-number').click()
            })

            // onChange should not be called immediately
            expect(mockOnChange).not.toHaveBeenCalled()

            act(() => {
                jest.runAllTimers()
            })

            expect(mockOnChange).toHaveBeenCalledWith(
                VoiceFlowNodeType.RouteToInternalNumber,
            )
        })
    })
})
