import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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
            props.item.meta.profile_picture_url,
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
            />,
        )

        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            props.item.meta.profile_picture_url,
        )
    })

    it('should render email when name is missing', () => {
        const item = { email: 'homer@simpson.com' }

        render(<UserDropdownItem item={item} />)

        expect(screen.getByText(item.email)).toBeInTheDocument()
    })

    it('should display tooltip when text is overflowing', async () => {
        const user = userEvent.setup()
        jest.spyOn(
            HTMLElement.prototype,
            'offsetWidth',
            'get',
        ).mockImplementation(() => 0)
        jest.spyOn(
            HTMLElement.prototype,
            'scrollWidth',
            'get',
        ).mockImplementation(() => 1)

        render(<UserDropdownItem {...props} />)

        await user.hover(screen.getByText(props.item.name))

        const tooltip = await screen.findByRole('tooltip')
        expect(
            within(tooltip).getByText(new RegExp(props.item.name, 'i')),
        ).toBeInTheDocument()
    })
})
