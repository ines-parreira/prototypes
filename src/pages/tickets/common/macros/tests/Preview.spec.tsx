import React from 'react'

import { render, screen } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { ticketInputFieldDefinition as mockTicketInputFieldDefinition } from 'fixtures/customField'
import {
    addAttachmentsAction,
    addInternalNoteAction,
    addTagsAction,
    forwardByEmailAction,
    httpAction,
    setCustomFieldValueAction as mockSetCustomFieldValueAction,
    setAssigneeAction,
    setOpenStatusAction,
    setPriorityAction,
    setSubjectAction,
    setTeamAssigneeAction,
    setTextAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import { assumeMock } from 'utils/testing'

import Preview, { CustomFieldName } from '../Preview'

const flags = {
    [FeatureFlagKey.MacroForwardByEmail]: true,
}

const defaultProps = {
    flags,
}

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')

const mockedUseCustomFieldDefinition = assumeMock(useCustomFieldDefinition)

jest.mock(
    'pages/common/forms/RichField/TicketRichField',
    () =>
        ({ value }: { value: { html: string; text: string } }) => (
            <div>
                TicketRichField: <div>{value.text}</div>
                <div>{value.html}</div>
            </div>
        ),
)

jest.mock(
    'pages/common/utils/labels',
    () =>
        ({
            ...jest.requireActual('pages/common/utils/labels'),
            TimedeltaLabel: ({ duration }: { duration: string }) => (
                <div>{duration}</div>
            ),
        }) as unknown,
)

describe('<Preview />', () => {
    it('should render action preview for adding attachments', () => {
        render(<Preview {...defaultProps} actions={[addAttachmentsAction]} />)

        expect(screen.getByText('Attach files:')).toBeInTheDocument()
        expect(screen.getByText('photo_library')).toBeInTheDocument()
        expect(
            screen.getByText(
                addAttachmentsAction.arguments.attachments![0].name!,
            ),
        ).toBeInTheDocument()
    })

    it('should render action preview for adding response text', () => {
        render(<Preview {...defaultProps} actions={[setTextAction]} />)

        setTextAction.arguments.body_text!.split('\n\n').forEach((text) => {
            expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument()
        })
    })

    it('should render setCustomFieldValue actions preview', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: {
                ...mockTicketInputFieldDefinition,
                id: mockSetCustomFieldValueAction.arguments
                    .custom_field_id as number,
            },
            isLoading: false,
        } as any)
        render(
            <Preview
                {...defaultProps}
                actions={[
                    mockSetCustomFieldValueAction,
                    {
                        ...mockSetCustomFieldValueAction,
                        arguments: {
                            ...mockSetCustomFieldValueAction.arguments,
                            custom_field_id: 2,
                        },
                    },
                ]}
            />,
        )

        expect(screen.getAllByText(/Input field/i)).toHaveLength(2)
        expect(screen.getAllByText(/Custom field value/)).toHaveLength(2)
    })

    it('should render preview for status update', () => {
        render(<Preview {...defaultProps} actions={[setOpenStatusAction]} />)

        expect(screen.getByText('Set status:')).toBeInTheDocument()
        expect(
            screen.getByText(setOpenStatusAction.arguments.status!),
        ).toBeInTheDocument()
    })

    it('should render preview for snoozing ticket', () => {
        render(<Preview {...defaultProps} actions={[snoozeTicketAction]} />)

        expect(screen.getByText('Snooze for')).toBeInTheDocument()

        expect(
            screen.getByText(snoozeTicketAction.arguments.snooze_timedelta!),
        ).toBeInTheDocument()
    })

    it('should render preview for setting priority when feature flag is enabled', () => {
        const props = {
            flags: {
                [FeatureFlagKey.TicketAllowPriorityUsage]: true,
            },
        }
        render(<Preview {...props} actions={[setPriorityAction]} />)

        expect(screen.getByText('Set priority:')).toBeInTheDocument()
        expect(
            screen.getByText(setPriorityAction.arguments.priority!),
        ).toBeInTheDocument()
    })

    it('should not render priority preview when feature flag is disabled', () => {
        const { container } = render(
            <Preview {...defaultProps} actions={[setPriorityAction]} />,
        )

        expect(container.textContent).not.toContain('Set priority:')
    })

    it('should render action preview for adding tags', () => {
        render(<Preview {...defaultProps} actions={[addTagsAction]} />)

        expect(screen.getByText('Add tags:')).toBeInTheDocument()

        addTagsAction.arguments.tags!.split(',').forEach((tag) => {
            expect(screen.getByText(tag)).toBeInTheDocument()
        })
    })

    it('should render action preview for assigning user', () => {
        render(<Preview {...defaultProps} actions={[setAssigneeAction]} />)

        expect(screen.getByText('Assign to user:')).toBeInTheDocument()

        expect(
            screen.getByText(setAssigneeAction.arguments.assignee_user!.name),
        ).toBeInTheDocument()
    })

    it('should render action preview for assigning team', () => {
        render(<Preview {...defaultProps} actions={[setTeamAssigneeAction]} />)

        expect(screen.getByText('Assign to team:')).toBeInTheDocument()

        expect(
            screen.getByText(
                setTeamAssigneeAction.arguments.assignee_team!.name,
            ),
        ).toBeInTheDocument()
    })

    it('should render action preview for setting subject', () => {
        render(<Preview {...defaultProps} actions={[setSubjectAction]} />)

        expect(screen.getByText('Set subject:')).toBeInTheDocument()
        expect(
            screen.getByText(setSubjectAction.arguments.subject!),
        ).toBeInTheDocument()
    })

    it('should render action preview for sending internal note', () => {
        render(<Preview {...defaultProps} actions={[addInternalNoteAction]} />)

        expect(screen.getByText('Send internal note:')).toBeInTheDocument()
        expect(
            screen.getByText(addInternalNoteAction.title),
        ).toBeInTheDocument()
    })

    it('should render action preview for forwarding email', () => {
        render(<Preview {...defaultProps} actions={[forwardByEmailAction]} />)

        expect(
            screen.getByText(new RegExp(forwardByEmailAction.title, 'i')),
        ).toBeInTheDocument()
        expect(
            screen.getByText(forwardByEmailAction.arguments.to!),
        ).toBeInTheDocument()
    })

    it('should render multiple action previews', () => {
        render(
            <Preview
                {...defaultProps}
                actions={[addTagsAction, addInternalNoteAction]}
            />,
        )

        expect(screen.getByText('Add tags:')).toBeInTheDocument()
        expect(screen.getByText('Send internal note:')).toBeInTheDocument()
    })

    it('should render external executed actions', () => {
        render(<Preview {...defaultProps} actions={[httpAction]} />)

        expect(
            screen.getByText(new RegExp(httpAction.name, 'i')),
        ).toBeInTheDocument()
    })
})

describe('<CustomFieldName />', () => {
    it('should render custom field name', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: mockTicketInputFieldDefinition,
            isLoading: false,
        } as any)
        render(
            <CustomFieldName
                customFieldId={mockTicketInputFieldDefinition.id}
            />,
        )

        expect(screen.getByText(/Field/i)).toBeInTheDocument()
        expect(screen.getByText(/Input field/i)).toBeInTheDocument()
    })

    it('should return null', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: {},
            isLoading: true,
        } as any)
        const { container } = render(<CustomFieldName customFieldId={1} />)

        expect(container.firstChild).toBeNull()
    })
})
