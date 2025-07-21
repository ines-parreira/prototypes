import React, { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { Tag } from '@gorgias/helpdesk-queries'

import { TagDropdownMenu } from 'tags'

import TagSearchSelect from '../TagSearchSelect'

const mockTag = 'mockTag'
jest.mock('tags', () => ({
    TagDropdownMenu: ({
        onClick,
        filterBy,
    }: ComponentProps<typeof TagDropdownMenu>) => {
        return (
            <div onClick={() => onClick({ name: mockTag })}>
                {'filterBy test: not ai agent tag ' +
                    filterBy?.({ name: 'not_ai_tag' } as Tag).toString()}
                {'filterBy test: ai agent tag ' +
                    filterBy?.({
                        name: 'ai_processing',
                    } as Tag).toString()}
                TagDropdownMenuMock
            </div>
        )
    },
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

        screen.getByText(/filterBy test: not ai agent tag true/)
        screen.getByText(/filterBy test: ai agent tag false/)

        fireEvent.click(screen.getByText(/TagDropdownMenuMock/))
        expect(screen.getByText(mockTag)).toBeInTheDocument()
        expect(
            screen.queryByText('TagDropdownMenuMock'),
        ).not.toBeInTheDocument()
        expect(props.onSelect).toHaveBeenCalledWith(mockTag)
    })
})
