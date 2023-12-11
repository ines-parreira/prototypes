import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {FeatureFlagKey} from 'config/featureFlags'
import {ticketInputFieldDefinition as mockTicketInputFieldDefinition} from 'fixtures/customField'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import {assumeMock} from 'utils/testing'

import Preview, {CustomFieldName} from '../Preview'
import {
    addInternalNoteAction,
    addTagsAction,
    setCustomFieldValueAction as mockSetCustomFieldValueAction,
} from '../../../../../fixtures/macro'

const flags = {
    [FeatureFlagKey.MacroForwardByEmail]: true,
}

const defaultProps = {
    flags,
}

jest.mock('hooks/customField/useCustomFieldDefinition')

const mockedUseCustomFieldDefinition = assumeMock(useCustomFieldDefinition)

describe('<Preview />', () => {
    it('should render simple action preview', () => {
        const {container} = render(
            <Preview {...defaultProps} actions={fromJS([addTagsAction])} />
        )
        expect(container.firstChild).toMatchSnapshot()
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
        const {container} = render(
            <Preview
                {...defaultProps}
                actions={fromJS([
                    mockSetCustomFieldValueAction,
                    {
                        ...mockSetCustomFieldValueAction,
                        arguments: {
                            ...mockSetCustomFieldValueAction.arguments,
                            custom_field_id: 2,
                        },
                    },
                ])}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render backend action preview', () => {
        const {container} = render(
            <Preview
                {...defaultProps}
                actions={fromJS([addInternalNoteAction])}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should multiple actions preview', () => {
        const {container} = render(
            <Preview
                {...defaultProps}
                actions={fromJS([addTagsAction, addInternalNoteAction])}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

describe('<CustomFieldName />', () => {
    it('should render custom field name', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: mockTicketInputFieldDefinition,
            isLoading: false,
        } as any)
        const {container} = render(
            <CustomFieldName
                customFieldId={mockTicketInputFieldDefinition.id}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should return null', () => {
        mockedUseCustomFieldDefinition.mockReturnValue({
            data: {},
            isLoading: true,
        } as any)
        const {container} = render(<CustomFieldName customFieldId={1} />)
        expect(container.firstChild).toBeNull()
    })
})
