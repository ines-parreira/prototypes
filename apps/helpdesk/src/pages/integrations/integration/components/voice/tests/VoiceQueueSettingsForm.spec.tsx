import { ReactNode } from 'react'

import { assumeMock, getLastMockCall, renderHook } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/helpdesk-queries'
import * as validators from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms/components/FormField'
import { voiceQueue } from 'fixtures/voiceQueue'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { renderWithRouter } from 'utils/testing'

import {
    QUEUE_CAPACITY_VALIDATION_ERROR,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_VALIDATION_ERROR,
} from '../constants'
import { getVoiceQueueEditableFields } from '../utils'
import VoiceQueueSettingsForm from '../VoiceQueueSettingsForm'
import { QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES } from '../waitMusicLibraryConstants'

jest.mock('@gorgias/helpdesk-validators', () => ({
    validateCreateVoiceQueue: jest.fn(),
    validateUpdateVoiceQueue: jest.fn(),
}))

// eslint-disable-next-line no-unused-vars
const mockUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>UnsavedChangesPrompt</div>
))

jest.mock('pages/common/components/UnsavedChangesPrompt', () => {
    const { forwardRef } = jest.requireActual('react')

    return {
        __esModule: true,
        default: forwardRef((props: any) =>
            mockUnsavedChangesPrompt(props as any),
        ),
    }
})

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

const mockValidateCreateVoiceQueue =
    validators.validateCreateVoiceQueue as jest.Mock
const mockValidateUpdateVoiceQueue =
    validators.validateUpdateVoiceQueue as jest.Mock

const onSubmitMock = jest.fn()
const wrapper = (props: {
    children?: ReactNode
    initialValues?: UpdateVoiceQueue
}) => (
    <VoiceQueueSettingsForm
        onSubmit={onSubmitMock}
        initialValues={props.initialValues}
    >
        {props.children}
        <div>Form Content</div>
        <FormField label="Name" name="name" />
        <FormField label="Ring Time" name="ring_time" />
        <FormField label="Wait Time" name="wait_time" />
        <FormField label="Capacity" name="capacity" />
        <FormField label="Wrap Up Time" name="wrap_up_time" />
        <FormField
            label="Is Wrap Up Time Enabled"
            name="is_wrap_up_time_enabled"
        />
        <FormField label="Wait Music" name="wait_music" />
        <FormField label="Distribution Mode" name="distribution_mode" />
        <FormField label="Linked Targets" name="linked_targets" />
        <FormField label="Priority Weight" name="priority_weight" />
        <FormField label="Target Scope" name="target_scope" />
        <button type="submit">Submit</button>
    </VoiceQueueSettingsForm>
)

const defaultValues: CreateVoiceQueue = {
    name: '',
    capacity: 100,
    priority_weight: 100,
    distribution_mode: PhoneRingingBehaviour.RoundRobin,
    linked_targets: [],
    ring_time: 30,
    target_scope: VoiceQueueTargetScope.AllAgents,
    wait_time: 120,
    wait_music: QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES,
    is_wrap_up_time_enabled: false,
    wrap_up_time: 30,
}

describe('VoiceQueueSettingsForm', () => {
    const renderComponent = (initialValues?: UpdateVoiceQueue) =>
        renderWithRouter(wrapper({ children: <div />, initialValues }))

    beforeEach(() => {
        mockValidateCreateVoiceQueue.mockReturnValue({})
        mockValidateUpdateVoiceQueue.mockReturnValue({})

        useAppDispatchMock.mockReturnValue(jest.fn)
    })

    it('should render the form content', () => {
        renderComponent()
        expect(screen.getByText('Form Content')).toBeInTheDocument()
    })

    it('should call onSubmit when the form is submitted', async () => {
        renderComponent()
        fireEvent.click(screen.getByRole('button', { name: /submit/i }))
        await waitFor(() => expect(onSubmitMock).toHaveBeenCalled())
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(
            () => useFormContext<CreateVoiceQueue>(),
            {
                wrapper,
            },
        )

        expect(result.current.getValues()).toEqual(defaultValues)
    })

    it('should initialize with initial values', () => {
        const { result } = renderHook(
            () => useFormContext<CreateVoiceQueue>(),
            {
                wrapper: ({ children }) =>
                    wrapper({
                        initialValues: voiceQueue,
                        children,
                    }),
            },
        )

        expect(result.current.getValues()).toEqual(
            getVoiceQueueEditableFields(voiceQueue),
        )
    })

    it('should show validation errors when create form is invalid', async () => {
        const validationErrors = [
            {
                path: 'name',
                message: 'Name is invalid',
            },
        ]
        mockValidateCreateVoiceQueue.mockReturnValue({
            errors: validationErrors,
        })

        renderComponent()

        act(() => {
            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: null },
            })
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(screen.getByText('Name is invalid')).toBeInTheDocument()
        })
    })

    it('should show validation errors when update form is invalid', async () => {
        const validationErrors = [
            {
                path: 'name',
                message: 'Name is required',
            },
        ]
        mockValidateUpdateVoiceQueue.mockReturnValue({
            errors: validationErrors,
        })

        renderComponent(voiceQueue)

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument()
        })
    })

    it('should validate custom min/max', async () => {
        renderComponent({
            ...voiceQueue,
            wait_time: 5,
            ring_time: 5,
            capacity: 0,
            wrap_up_time: 5,
            is_wrap_up_time_enabled: true,
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(
                screen.getByText(RING_TIME_VALIDATION_ERROR),
            ).toBeInTheDocument()
            expect(
                screen.getByText(WAIT_TIME_VALIDATION_ERROR),
            ).toBeInTheDocument()
            expect(
                screen.getByText(QUEUE_CAPACITY_VALIDATION_ERROR),
            ).toBeInTheDocument()
        })
    })

    it('should show unsaved changes prompt when form is dirty', async () => {
        const validationErrors = [
            {
                path: 'name',
                message: 'Name is required',
            },
        ]
        mockValidateCreateVoiceQueue.mockReturnValue({
            errors: validationErrors,
        })
        mockValidateUpdateVoiceQueue.mockReturnValue({
            errors: validationErrors,
        })
        renderComponent()

        act(() => {
            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'New Name' },
            })
        })

        await waitFor(() => {
            expect(mockUnsavedChangesPrompt).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    when: true,
                }),
            )
        })

        getLastMockCall(mockUnsavedChangesPrompt)[0].onSave()
        expect(notify).toHaveBeenCalledWith({
            message:
                'Please make sure all fields are filled out correctly before saving',
            status: NotificationStatus.Error,
        })
    })
})
