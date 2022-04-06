import React from 'react'
import {render} from '@testing-library/react'

import ActionWarning from '../ActionWarning'

describe('<ActionWarning />', () => {
    it('should render a warning', () => {
        const {container} = render(<ActionWarning>Foo bar</ActionWarning>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
