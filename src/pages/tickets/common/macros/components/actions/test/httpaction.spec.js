import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import HttpAction from '../HttpAction'

describe('HTTP action component', () => {
    let component
    const action = fromJS({
        arguments: {
            form: []
        },
        title: 'HTTP hook',
        type: 'user',
        name: 'http'
    })

    beforeEach(() => {
        component = shallow(
            <HttpAction
                action={action}
                index={1}
                updateActionArgs={() => Promise.resolve()}
                updateActionTitle={() => Promise.resolve()}
            />
        )
    })

    it('should render the HTTP action component', () => {
        expect(component).toMatchSnapshot()
    })
})

