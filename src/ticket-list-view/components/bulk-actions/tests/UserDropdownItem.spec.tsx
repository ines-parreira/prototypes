import {render, screen} from '@testing-library/react'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import UserDropdownItem from '../UserDropdownItem'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

describe('<UserDropdownItem />', () => {
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
        render(<UserDropdownItem {...props} />)

        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            props.item.meta.profile_picture_url
        )
        expect(screen.getByText(props.item.name)).toBeInTheDocument()
    })

    it('should render with avatar from redux user data', () => {
        useAppSelectorMock.mockReturnValue([props.item])

        render(
            <UserDropdownItem
                item={{
                    name: 'Homer Simpson',
                }}
            />
        )

        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            props.item.meta.profile_picture_url
        )
    })

    it('should render email when name is missing', () => {
        const item = {email: 'homer@simpson.com'}

        render(<UserDropdownItem item={item} />)

        expect(screen.getByText(item.email)).toBeInTheDocument()
    })
})
