import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {TagDropdownMenu} from 'tags'

import TagSearchSelect from '../TagSearchSelect'

const mockTag = 'mockTag'
jest.mock('tags', () => ({
    TagDropdownMenu: ({onClick}: ComponentProps<typeof TagDropdownMenu>) => (
        <button onClick={() => onClick({name: mockTag})}>
            TagDropdownMenuMock
        </button>
    ),
}))

describe('<TagSearchSelect />', () => {
    const props = {
        onSelect: jest.fn(),
    }

    it('should display selected tag', () => {
        const defaultTag = 'default tag'
        render(<TagSearchSelect {...props} defaultTag={defaultTag} />)

        expect(screen.getByText(defaultTag)).toBeInTheDocument()
    })

    it('should select a tag', () => {
        render(<TagSearchSelect {...props} />)

        fireEvent.click(screen.getByText('Choose tag'))
        fireEvent.click(screen.getByText('TagDropdownMenuMock'))

        expect(screen.getByText(mockTag)).toBeInTheDocument()
        expect(
            screen.queryByText('TagDropdownMenuMock')
        ).not.toBeInTheDocument()
        expect(props.onSelect).toHaveBeenCalledWith(mockTag)
    })
})
