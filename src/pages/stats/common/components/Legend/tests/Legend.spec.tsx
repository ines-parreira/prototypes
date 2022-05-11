import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import Legend from '../Legend'

describe('Legend', () => {
    const minProps: ComponentProps<typeof Legend> = {
        labels: [
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
        ],
    }

    it('should render a legend', () => {
        expect(shallow(<Legend {...minProps} />)).toMatchSnapshot()
    })
})
