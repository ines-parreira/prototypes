import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import InfobarWidget from '../InfobarWidget'

const defaultSource = fromJS({
    ticket: {
        customer: {
            integrations: [{
                foo: 'bar'
            }]
        }
    }
})

const defaultEditing = {
    actions: {
        foo: () => {},
        removeEditedWidget: () => {}
    },
    isEditing: false,
    isDragging: false,
    canDrop: () => true
}

const defaultTemplate = fromJS({
    type: 'card',
    path: ['ticket', 'customer', 'integrations', '0'],
    title: 'Duh',
    widgets: [{
        path: '',
        type: 'card',
        title: 'Foo container',
        widgets: []
    }]
})

describe('InfobarWidget', () => {
    it('should not throw if card board widget data is an object', () => {
        const source = defaultSource.setIn([ 'ticket', 'customer', 'integrations', '0'], {aaa: 'bbb'})
        expect(() => {
            shallow(
                <InfobarWidget
                    widget={fromJS({})}
                    template={defaultTemplate}
                    editing={defaultEditing}
                    source={source}
                />
            )
        }).not.toThrow()
    })
})
