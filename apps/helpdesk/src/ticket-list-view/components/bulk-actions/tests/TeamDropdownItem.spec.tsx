import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Emoji } from 'emoji-mart'

import { TeamDropdownItem } from '../TeamDropdownItem'

jest.mock('emoji-mart')
const mockEmojiMart = assumeMock(Emoji)
mockEmojiMart.mockReturnValue(<div>mockEmojiMart</div>)

describe('<TeamDropdownItem />', () => {
    const props = {
        item: {
            name: 'Team Simpsons',
            decoration: {
                emoji: 'white_frowning_face',
            },
        },
    }

    it('should render with emoji', () => {
        render(<TeamDropdownItem {...props} />)

        expect(screen.getByText('mockEmojiMart')).toBeInTheDocument()
    })

    it('should render with avatar', () => {
        render(
            <TeamDropdownItem
                item={{
                    name: 'Team Simpsons',
                }}
            />,
        )

        expect(screen.getByText('TS')).toBeInTheDocument()
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

        render(<TeamDropdownItem {...props} />)

        await user.hover(screen.getByText(props.item.name))

        const tooltip = await screen.findByRole('tooltip')
        expect(
            within(tooltip).getByText(new RegExp(props.item.name, 'i')),
        ).toBeInTheDocument()
    })
})
