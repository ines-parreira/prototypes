import React from 'react'

import { render, screen } from '@testing-library/react'
import { Emoji } from 'emoji-mart'

import { assumeMock } from 'utils/testing'

import TeamDropdownItem from '../TeamDropdownItem'

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
})
