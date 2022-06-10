import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {DropdownOptionItem} from '../DropdownOptionItem'

const minProps: ComponentProps<typeof DropdownOptionItem> = {
    option: {
        key: 'discount/request',
        label: 'discount/request',
        description: 'A request for a discount',
    },
    renderAction: () => null,
    renderInfo: () => null,
}

describe('<DropdownnOptionItem/>', () => {
    it('should display the default dropdown option', () => {
        const {container} = render(<DropdownOptionItem {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
