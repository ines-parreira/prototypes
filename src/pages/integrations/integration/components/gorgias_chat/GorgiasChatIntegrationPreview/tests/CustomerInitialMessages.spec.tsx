import React from 'react'

import { render } from '@testing-library/react'

import CustomerInitialMessages from '../CustomerInitialMessages'

Date.now = jest.fn(() => new Date('2019-01-26T12:34:56.000Z').valueOf())

describe('<CustomerInitialMessages/>', () => {
    it('should render timestamps and messages', () => {
        const { container } = render(
            <CustomerInitialMessages
                conversationColor="red"
                messages={['Hey hey', 'Hello', 'How are you doing?']}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
