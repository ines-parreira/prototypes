import React from 'react'
import {shallow} from 'enzyme'
import Legend from '../Legend'

describe('Legend', () => {
    it('should not render a legend (no labels, invalid labels)', () => {
        expect(shallow(<Legend/>)).toMatchSnapshot()
        expect(shallow(<Legend labels={[]}/>)).toMatchSnapshot()
        expect(shallow(<Legend labels={{}}/>)).toMatchSnapshot()
        expect(shallow(<Legend labels={''}/>)).toMatchSnapshot()
    })

    it('should render a legend', () => {
        const labels = [{
            name: 'line 1',
            backgroundColor: '#000'
        }, {
            name: 'line 2',
            backgroundColor: '#fff'

        }]
        expect(shallow(<Legend labels={labels}/>)).toMatchSnapshot()
    })
})
