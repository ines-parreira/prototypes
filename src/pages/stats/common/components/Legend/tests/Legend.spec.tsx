import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

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
        const {container} = render(<Legend {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
