import { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Emoji } from 'emoji-mart'

import TeamDropdownItem from '../TeamDropdownItem'

jest.mock('emoji-mart')
const mockEmojiMart = assumeMock(Emoji)
mockEmojiMart.mockReturnValue(<div>mockEmojiMart</div>)

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: ({ children }: { children: ReactNode }) => (
        <div>Tooltip{children}</div>
    ),
}))

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

    it('should display tooltip when text is overflowing', () => {
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

        expect(screen.getByText(/Tooltip/)).toBeInTheDocument()
        expect(
            screen.getAllByText(new RegExp(props.item.name, 'i')),
        ).toHaveLength(2)
    })
})
