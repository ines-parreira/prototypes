import {mount} from 'enzyme'
import React from 'react'

import CustomerInitialMessages from '../CustomerInitialMessages'

Date.now = jest.fn(() => new Date('2019-01-26T12:34:56.000Z').valueOf())

describe('<CustomerInitialMessages/>', () => {
    it('should render timestamps and messages', () => {
        const component = mount(
            <CustomerInitialMessages
                conversationColor="red"
                messages={['Hey hey', 'Hello', 'How are you doing?']}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
