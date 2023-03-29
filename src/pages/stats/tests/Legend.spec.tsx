import React from 'react'
import {render} from '@testing-library/react'

import colors from 'assets/tokens/colors.json'

import Legend from '../Legend'

describe('<Legend />', () => {
    it('should render the legend', () => {
        const {container} = render(
            <Legend
                items={[
                    {
                        label: 'Foo',
                        color: colors['📺 Classic'].Main.Variations.Primary_3
                            .value,
                    },
                    {
                        label: 'Bar',
                        color: colors['📺 Classic'].Feedback.Variations.Error_3
                            .value,
                    },
                ]}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
