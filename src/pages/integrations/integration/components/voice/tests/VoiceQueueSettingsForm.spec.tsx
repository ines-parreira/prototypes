import { ReactNode } from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import { useFormContext } from 'react-hook-form'

import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    UpdateVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'
import * as validators from '@gorgias/api-validators'

import { FormField } from 'core/forms/components/FormField'
import { voiceQueue } from 'fixtures/voiceQueue'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock, getLastMockCall, renderWithRouter } from 'utils/testing'

import VoiceQueueSettingsForm from '../VoiceQueueSettingsForm'
import { QUEUE_DEFAULT_WAIT_MUSIC_PREFERENCES } from '../waitMusicLibraryConstants'

jest.mock('@gorgias/api-validators', () => ({
    validateCreateVoiceQueue: jest.fn(),
    validateUpdateVoiceQueue: jest.fn(),
}))

// eslint-disable-next-line no-unused-vars
const mockUnsavedChangesPrompt = jest.fn((_args: any) => (
    <div>UnsavedChangesPrompt</div>
))

// Mock the module
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

        expect(result.current.getValues()).toEqual(voiceQueue)
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
