import React from 'react'
import {shallow} from 'enzyme'

import Legend from '../Legend.tsx'

describe('Legend', () => {
    it('should not render a legend (no labels, invalid labels)', () => {
        expect(shallow(<Legend />)).toMatchSnapshot()
        expect(shallow(<Legend labels={[]} />)).toMatchSnapshot()
        expect(shallow(<Legend labels={{}} />)).toMatchSnapshot()
        expect(shallow(<Legend labels={''} />)).toMatchSnapshot()
    })

    it('should render a legend', () => {
        const labels = [
            {
                name: 'line 1',
                background: '#000',
            },
            {
                name: 'line 2',
                background: '#fff',
            },
            {
                name: 'square line 1',
                background:
                    'repeating-linear-gradient (60deg, red 80%, red 90%, white 0px, white 100%)',
                shape: 'square',
            },
            {
                aheadLabel: 'Label ahead of the legend',
                name: 'Rectangle name',
                background: 'red',
                shape: 'rectangle',
            },
        ]
        expect(shallow(<Legend labels={labels} />)).toMatchSnapshot()
    })
})
