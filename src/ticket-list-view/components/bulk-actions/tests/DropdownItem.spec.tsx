import React from 'react'
import {render, screen} from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'

import DropdownItem from '../DropdownItem'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

describe('<DropdownItem />', () => {
    const props = {
        item: {
            name: 'Homer Simpson',
            meta: {
                profile_picture_url: 'homer/avatar/url',
            },
        },
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue([])
    })

    it('should render with avatar from item', () => {
        render(<DropdownItem {...props} />)

        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            props.item.meta.profile_picture_url
        )
        expect(screen.getByText(props.item.name)).toBeInTheDocument()
    })

    it('should render with avatar from redux user data', () => {
        useAppSelectorMock.mockReturnValue([props.item])

        render(
            <DropdownItem
                item={{
                    name: 'Homer Simpson',
                }}
            />
        )

        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            props.item.meta.profile_picture_url
        )
    })
})
