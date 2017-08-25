import React from 'react'
import {render} from 'enzyme'
import {Map} from 'immutable'
import {Entity} from 'draft-js'
import Mention from '../index'

describe('Mention', () => {
    it('can render when mention is an Object', () => {
        const mention = {}
        const entityKey = Entity.create('mention', 'SEGMENTED', {mention})
        const result = render(<Mention entityKey={entityKey} theme={Map()}/>)
        expect(result.length).toEqual(1)
    })
})
