import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { EditorState, RichUtils } from 'draft-js'

import { assumeMock } from 'utils/testing'

import InlineStyle from '../InlineStyle'

jest.mock('draft-js', () => ({
    ...jest.requireActual('draft-js'),
    RichUtils: {
        toggleInlineStyle: jest.fn(),
        toggleBlockType: jest.fn(),
        getCurrentBlockType: jest.fn(() => 'unstyled'),
        onTab: jest.fn(),
    },
}))

const mockGetCurrentBlockType = assumeMock(RichUtils.getCurrentBlockType)

describe('InlineStyle', () => {
    let mockGetEditorState: jest.Mock
    let mockSetEditorState: jest.Mock

    beforeEach(() => {
        mockGetEditorState = jest.fn()
        mockSetEditorState = jest.fn()

        const editorState = EditorState.createEmpty()
        mockGetEditorState.mockReturnValue(editorState)
    })

    it('renders the button with correct name and icon', () => {
        render(
            <InlineStyle
                name="Bold"
                icon="bold-icon"
                style="BOLD"
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(
            screen.getByRole('button', { name: /Bold/i }),
        ).toBeInTheDocument()
    })

    it('calls toggleInlineStyle when clicked (inline style)', () => {
        render(
            <InlineStyle
                name="Bold"
                icon="bold-icon"
                style="BOLD"
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        const button = screen.getByRole('button', { name: /Bold/i })
        fireEvent.click(button)

        expect(RichUtils.toggleInlineStyle).toHaveBeenCalled()
    })

    it('calls toggleBlockType when clicked (block style)', () => {
        render(
            <InlineStyle
                name="Heading"
                icon="heading-icon"
                style="header-one"
                isBlockType
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        const button = screen.getByRole('button', { name: /Heading/i })
        fireEvent.click(button)

        expect(RichUtils.toggleBlockType).toHaveBeenCalled()
    })

    it('calls onTab when block type is a list', () => {
        mockGetCurrentBlockType.mockReturnValue('unordered-list-item')

        render(
            <InlineStyle
                name="List"
                icon="list-icon"
                style="unordered-list-item"
                isBlockType
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        const button = screen.getByRole('button', { name: /List/i })
        fireEvent.click(button)

        expect(RichUtils.onTab).toHaveBeenCalled()
    })
})
