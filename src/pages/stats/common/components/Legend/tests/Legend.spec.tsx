import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import colorTokens from '@gorgias/design-tokens/dist/tokens/colors.json'

import Legend from '../Legend'

describe('Legend', () => {
    const minProps: ComponentProps<typeof Legend> = {
        labels: [
            {
                name: 'line 1',
                background: colorTokens['📺 Classic'].Neutral.Grey_6.value,
            },
            {
                name: 'line 2',
                background: colorTokens['📺 Classic'].Neutral.Grey_0.value,
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
        const { container } = render(<Legend {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
