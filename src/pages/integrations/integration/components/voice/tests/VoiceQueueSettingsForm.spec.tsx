import React, { ReactNode } from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import { useFormContext } from 'react-hook-form'

import {
    CreateVoiceQueue,
    PhoneRingingBehaviour,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'
import * as validators from '@gorgias/api-validators'

import { FormField } from 'core/forms/components/FormField'
import useAppDispatch from 'hooks/useAppDispatch'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock, getLastMockCall, renderWithRouter } from 'utils/testing'

import VoiceQueueSettingsForm from '../VoiceQueueSettingsForm'
import { DEFAULT_WAIT_MUSIC_PREFERENCES } from '../waitMusicLibraryConstants'

jest.mock('@gorgias/api-validators', () => ({
    validateVoiceQueue: jest.fn(),
}))

jest.mock('pages/common/components/UnsavedChangesPrompt')
const UnsavedChangesPromptMock = assumeMock(UnsavedChangesPrompt)

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

const mockValidateVoiceQueue = validators.validateVoiceQueue as jest.Mock

const onSubmitMock = jest.fn()
const wrapper = (props: { children: ReactNode }) => (
    <VoiceQueueSettingsForm onSubmit={onSubmitMock}>
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
    wait_music: DEFAULT_WAIT_MUSIC_PREFERENCES,
}

describe('VoiceQueueSettingsForm', () => {
    const renderComponent = () =>
        renderWithRouter(wrapper({ children: <div /> }))

    beforeEach(() => {
        mockValidateVoiceQueue.mockReturnValue({})
        UnsavedChangesPromptMock.mockReturnValue(
            <div>Unsaved Changes Prompt</div>,
        )
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

    it.skip('should show validation errors when form is invalid', async () => {
        const validationErrors = [
            {
                path: 'name',
                message: 'Name is required',
            },
        ]
        mockValidateVoiceQueue.mockReturnValue({ errors: validationErrors })

        renderComponent()

        act(() => {
            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: null },
            })
        })

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
        mockValidateVoiceQueue.mockReturnValue({ errors: validationErrors })
        renderComponent()

        act(() => {
            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'New Name' },
            })
        })

        await waitFor(() => {
            expect(UnsavedChangesPromptMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    when: true,
                }),
                {},
            )
        })

        getLastMockCall(UnsavedChangesPromptMock)[0].onSave()
        expect(notify).toHaveBeenCalledWith({
            message:
                'Please make sure all fields are filled out correctly before saving',
            status: NotificationStatus.Error,
        })
    })
})
