import {render} from '@testing-library/react'
import React from 'react'

import DropdownItemLabel from '../DropdownItemLabel'

describe('<DropdownItemLabel />', () => {
    it('should render', () => {
        const {container} = render(
            <DropdownItemLabel
                caption="Bar"
                prefix={<i className="material-icons">add</i>}
                suffix={<i className="material-icons">chevron_right</i>}
            >
                Foo
            </DropdownItemLabel>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
