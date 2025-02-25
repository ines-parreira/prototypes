import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { WorkflowEditorActionButtons } from '../WorkflowEditorActionButtons'

describe('WorkflowEditorActionButtons', () => {
    const defaultProps = {
        isNewWorkflow: false,
        isFetchPending: false,
        isSavePending: false,
        isPublishPending: false,
        isDraft: true,
        isDirty: true,
        isTestDisabled: false,
        onCancel: jest.fn(),
        onSave: jest.fn(),
        onTest: jest.fn(),
        onPublish: jest.fn(),
        onDiscard: jest.fn(),
        onViewChannel: jest.fn(),
    }

    test('renders Test button and handles click with new workflow', () => {
        render(
            <WorkflowEditorActionButtons
                {...{ ...defaultProps, isNewWorkflow: true }}
            />,
        )

        const testButton = screen.getByText('Test')
        expect(testButton).toBeInTheDocument()

        fireEvent.click(testButton)
        expect(defaultProps.onTest).toHaveBeenCalled()
    })
    test('renders Test button and handles click', () => {
        render(<WorkflowEditorActionButtons {...defaultProps} />)

        const testButton = screen.getByText('Test')
        expect(testButton).toBeInTheDocument()

        fireEvent.click(testButton)
        expect(defaultProps.onTest).toHaveBeenCalled()
    })

    test('does not call onTest when Test button is disabled', () => {
        render(
            <WorkflowEditorActionButtons
                {...defaultProps}
                isTestDisabled={true}
            />,
        )

        const testButton = screen.getByText('Test')
        fireEvent.click(testButton)
        expect(defaultProps.onTest).not.toHaveBeenCalled()
    })

    test('renders Save button and handles click', () => {
        render(<WorkflowEditorActionButtons {...defaultProps} />)

        const saveButton = screen.getByText('Save')
        expect(saveButton).toBeInTheDocument()

        fireEvent.click(saveButton)
        expect(defaultProps.onSave).toHaveBeenCalled()
    })

    test('does not call onSave when Save button is disabled', () => {
        render(
            <WorkflowEditorActionButtons {...defaultProps} isDirty={false} />,
        )

        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)
        expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    test('renders Publish button and handles click', () => {
        render(<WorkflowEditorActionButtons {...defaultProps} />)

        const publishButton = screen.getByText('Publish')
        expect(publishButton).toBeInTheDocument()

        fireEvent.click(publishButton)
        expect(defaultProps.onPublish).toHaveBeenCalled()
    })

    test('renders Cancel button and handles click for new workflow', () => {
        render(
            <WorkflowEditorActionButtons
                {...defaultProps}
                isNewWorkflow={true}
            />,
        )

        const cancelButton = screen.getByText('Cancel')
        expect(cancelButton).toBeInTheDocument()

        fireEvent.click(cancelButton)
        expect(defaultProps.onCancel).toHaveBeenCalled()
    })

    test('renders View Channel button for non-draft workflows', () => {
        render(
            <WorkflowEditorActionButtons {...defaultProps} isDraft={false} />,
        )

        const viewChannelButton = screen.getByText('chat')
        expect(viewChannelButton).toBeInTheDocument()

        fireEvent.click(viewChannelButton)
        expect(defaultProps.onViewChannel).toHaveBeenCalled()
    })
})
