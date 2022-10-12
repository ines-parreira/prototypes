import React from 'react'
import {render} from '@testing-library/react'

import BaseButton from '../BaseButton'

describe('<BaseButton />', () => {
    it('should render a button', () => {
        const {container} = render(
            <BaseButton>
                {(elementAttributes) => <div {...elementAttributes}>foo</div>}
            </BaseButton>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
