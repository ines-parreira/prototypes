import {render} from '@testing-library/react'
import React from 'react'

import IconInput from '../IconInput'

describe('<IconInput />', () => {
    it('should render an icon', () => {
        const {container} = render(
            <IconInput icon="check" className="iconClassName" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
