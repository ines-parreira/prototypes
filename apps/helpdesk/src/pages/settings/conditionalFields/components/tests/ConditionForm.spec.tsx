import type { ComponentProps } from 'react'
import React from 'react'

import { history } from '@repo/routing'
import { assumeMock, render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import type { CustomFieldCondition } from '@gorgias/helpdesk-queries'
import { ExpressionFieldType } from '@gorgias/helpdesk-types'

import { customFieldCondition } from 'fixtures/customFieldCondition'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { useSaveCondition } from '../../hooks/useSaveCondition'
import { EditConditionForm as ConditionForm } from '../ConditionForm'
import { DeletionPopover } from '../DeletionPopover'
import { ExpressionField } from '../ExpressionField'
import { DefaultExportThenField as ThenField } from '../ThenField'

jest.mock('../../hooks/useSaveCondition', () => ({
    useSaveCondition: jest.fn(),
}))
jest.mock('../DeletionPopover', () => ({
    DeletionPopover: jest.fn(),
}))
jest.mock('../ExpressionField', () => ({
    ExpressionField: jest.fn(() => <div>Expression field</div>),
}))
jest.mock('../ThenField', () => ({
    DefaultExportThenField: jest.fn(() => <div>Then field</div>),
}))
jest.spyOn(history, 'push')

const DeletionPopoverMock = assumeMock(DeletionPopover)
const useSaveConditionMock = assumeMock(useSaveCondition)

describe('ConditionForm', () => {
    const onDisplayConfirmationMock = jest.fn()
    const onSubmitMock = jest.fn()

    beforeEach(() => {
        DeletionPopoverMock.mockImplementation(
            ({ children }: ComponentProps<typeof DeletionPopover>) => (
                <div>
                    {children({
                        uid: 'uid',
                        onDisplayConfirmation: onDisplayConfirmationMock,
                        elementRef: jest.fn(),
                    })}
                </div>
            ),
        )
        useSaveConditionMock.mockReturnValue({
            onSubmit: onSubmitMock,
            isSubmitting: false,
        })
    })

    const condition: CustomFieldCondition = {
        ...customFieldCondition,
        id: 1,
        name: 'Test Condition',
        deactivated_datetime: null,
        requirements: [{ field_id: 1, type: ExpressionFieldType.Required }],
    }

    it('should render the condition name and description fields', () => {
        render(<ConditionForm />)

        expect(screen.getByText('Condition name')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(
                'Provide a name for condition. E.g: Contact Reason Conditions',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Condition description')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(
                'Describe how the condition works. E.g: Display when contact reason includes quality and shipping',
            ),
        ).toBeInTheDocument()
    })

    it('should render the requirements and expression fields', () => {
        render(<ConditionForm />)

        expect(ExpressionField).toHaveBeenCalled()
        expect(ThenField).toHaveBeenCalled()
        expect(screen.getByText('Then field')).toBeInTheDocument()
    })

    it('should populate the name field with the existing condition value', () => {
        render(<ConditionForm condition={condition} />)

        expect(screen.getByDisplayValue('Test Condition')).toBeInTheDocument()
    })

    describe('Enable condition toggle', () => {
        it('should render as enabled when the condition is active', () => {
            render(<ConditionForm condition={condition} />)

            expect(screen.getByRole('switch')).toBeChecked()
        })

        it('should render as disabled when the condition is deactivated', () => {
            render(
                <ConditionForm
                    condition={{
                        ...condition,
                        deactivated_datetime: '2024-01-01T00:00:00.000Z',
                    }}
                />,
            )

            expect(screen.getByRole('switch')).not.toBeChecked()
        })

        it('should submit a deactivation date when an active condition is disabled', async () => {
            const user = userEvent.setup()
            render(<ConditionForm condition={condition} />)

            await user.click(screen.getByRole('switch'))
            await user.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(onSubmitMock).toHaveBeenCalled()
            })
            expect(onSubmitMock.mock.calls[0][0].deactivated_datetime).toEqual(
                expect.any(String),
            )
        })

        it('should submit a null deactivation date when a deactivated condition is enabled', async () => {
            const user = userEvent.setup()
            render(
                <ConditionForm
                    condition={{
                        ...condition,
                        deactivated_datetime: '2024-01-01T00:00:00.000Z',
                    }}
                />,
            )

            await user.click(screen.getByRole('switch'))
            await user.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(onSubmitMock).toHaveBeenCalled()
            })
            expect(
                onSubmitMock.mock.calls[0][0].deactivated_datetime,
            ).toBeNull()
        })
    })

    it('should call onSubmit with the form data on valid submit', async () => {
        const user = userEvent.setup()
        render(<ConditionForm condition={condition} />)

        const nameInput = screen.getByDisplayValue('Test Condition')
        await user.clear(nameInput)
        await user.type(nameInput, 'Updated Condition')
        await user.click(screen.getByRole('button', { name: 'Save Changes' }))

        await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Updated Condition' }),
            )
        })
    })

    it('should render the submit button', () => {
        render(<ConditionForm />)

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeInTheDocument()
    })

    it('should navigate to the conditions route when cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<ConditionForm condition={condition} />)

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should render the DeletionPopover when a condition is provided', () => {
        render(<ConditionForm condition={condition} />)

        expect(DeletionPopoverMock).toHaveBeenCalledWith(
            expect.objectContaining({
                condition,
                redirect: true,
            }),
            {},
        )
    })

    it('should call onDisplayConfirmation when the delete button is clicked', async () => {
        const user = userEvent.setup()
        render(<ConditionForm condition={condition} />)

        await user.click(
            screen.getByRole('button', { name: /Delete Condition/i }),
        )

        expect(onDisplayConfirmationMock).toHaveBeenCalled()
    })
})
