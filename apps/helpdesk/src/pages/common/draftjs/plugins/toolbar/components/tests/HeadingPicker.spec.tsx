import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { EditorState, RichUtils } from 'draft-js'

import HeadingPicker from '../HeadingPicker'

jest.mock('appNode', () => ({
    useAppNode: () => document.body,
}))

jest.mock('draft-js', () => ({
    ...jest.requireActual('draft-js'),
    RichUtils: {
        ...jest.requireActual('draft-js').RichUtils,
        getCurrentBlockType: jest.fn(() => 'unstyled'),
        toggleBlockType: jest.fn((editorState) => editorState),
    },
}))

const mockGetCurrentBlockType = assumeMock(RichUtils.getCurrentBlockType)
const mockToggleBlockType = assumeMock(RichUtils.toggleBlockType)

describe('HeadingPicker', () => {
    let mockGetEditorState: jest.Mock
    let mockSetEditorState: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        const editorState = EditorState.createEmpty()
        mockGetEditorState = jest.fn(() => editorState)
        mockSetEditorState = jest.fn()
        mockGetCurrentBlockType.mockReturnValue('unstyled')
    })

    it('renders the heading button', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(
            screen.getByRole('button', { name: /title/i }),
        ).toBeInTheDocument()
    })

    it('opens popover when heading button is clicked', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /title/i }))

        expect(screen.getByText('Heading 1')).toBeInTheDocument()
        expect(screen.getByText('Heading 2')).toBeInTheDocument()
        expect(screen.getByText('Heading 3')).toBeInTheDocument()
    })

    it('calls toggleBlockType with header-one when Heading 1 is selected', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /title/i }))
        fireEvent.click(screen.getByText('Heading 1'))

        expect(mockToggleBlockType).toHaveBeenCalledWith(
            expect.anything(),
            'header-one',
        )
        expect(mockSetEditorState).toHaveBeenCalled()
    })

    it('calls toggleBlockType with header-two when Heading 2 is selected', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /title/i }))
        fireEvent.click(screen.getByText('Heading 2'))

        expect(mockToggleBlockType).toHaveBeenCalledWith(
            expect.anything(),
            'header-two',
        )
    })

    it('calls toggleBlockType with header-three when Heading 3 is selected', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /title/i }))
        fireEvent.click(screen.getByText('Heading 3'))

        expect(mockToggleBlockType).toHaveBeenCalledWith(
            expect.anything(),
            'header-three',
        )
    })

    it('shows active state when current block is a heading', () => {
        mockGetCurrentBlockType.mockReturnValue('header-one')

        const { container } = render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(container.querySelector('[class*="isActive"]')).toBeTruthy()
    })

    it('does not show active state when current block is unstyled', () => {
        mockGetCurrentBlockType.mockReturnValue('unstyled')

        const { container } = render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(container.querySelector('[class*="isActive"]')).toBeFalsy()
    })

    it('disables the button when isDisabled is true', () => {
        const { container } = render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
                isDisabled
            />,
        )

        expect(container.querySelector('[class*="isDisabled"]')).toBeTruthy()
    })

    it('calls setEditorState and closes popover after selecting a heading', () => {
        render(
            <HeadingPicker
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /title/i }))
        expect(screen.getByText('Heading 1')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Heading 1'))

        expect(mockSetEditorState).toHaveBeenCalled()
        expect(mockToggleBlockType).toHaveBeenCalledWith(
            expect.anything(),
            'header-one',
        )
    })
})
