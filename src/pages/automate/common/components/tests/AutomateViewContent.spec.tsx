import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import AutomateViewContent from '../AutomateViewContent'

describe('AutomateViewContent', () => {
    test('renders description and help link correctly', () => {
        render(
            <AutomateViewContent
                description="Test Description"
                helpUrl="http://example.com"
                helpTitle="Help"
            >
                <div>Child Content</div>
            </AutomateViewContent>
        )
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Help')).toBeInTheDocument()
        expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    test('renders children correctly', () => {
        renderWithRouter(
            <AutomateViewContent>
                <div>Child Content</div>
            </AutomateViewContent>
        )
        expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    test('renders buttons and handles onSubmit and onCancel', () => {
        const handleSubmit = jest.fn()
        const handleCancel = jest.fn()

        renderWithRouter(
            <AutomateViewContent
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={true}
                isCancelable={true}
            >
                <div>Child Content</div>
            </AutomateViewContent>
        )

        const saveButton = screen.getByText('Save changes')
        const cancelButton = screen.getByText('Cancel')

        expect(saveButton).toBeInTheDocument()
        expect(cancelButton).toBeInTheDocument()

        fireEvent.click(saveButton)
        fireEvent.click(cancelButton)

        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(handleCancel).toHaveBeenCalledTimes(1)
    })

    test('renders UnsavedChangesPrompt when onSubmit and onCancel is provided', () => {
        const handleSubmit = jest.fn()
        const handleCancel = jest.fn()
        renderWithRouter(
            <AutomateViewContent
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={true}
                isCancelable={true}
            >
                <div>Child Content</div>
            </AutomateViewContent>
        )

        expect(screen.getByText('Child Content')).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })
})
