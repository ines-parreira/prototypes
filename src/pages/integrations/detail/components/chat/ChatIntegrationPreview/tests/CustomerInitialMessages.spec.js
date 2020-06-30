// @flow
import {mount} from 'enzyme'
import React from 'react'

import CustomerInitialMessages from '../CustomerInitialMessages'

jest.spyOn(global.Date, 'now').mockImplementationOnce(
    () => new Date('2019-01-26T12:34:56.000Z')
)

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
