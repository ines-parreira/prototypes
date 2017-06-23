import React from 'react'
import renderer from 'react-test-renderer'
import Loader from '../Loader'

describe('Loader component', () => {
    it('simple message', () => {
        const component = renderer.create(
            <Loader message={'hello'}/>
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
})
