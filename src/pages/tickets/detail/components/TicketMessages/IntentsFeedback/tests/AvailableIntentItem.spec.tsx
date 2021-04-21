import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {AvailableIntentItem} from '../AvailableIntentItem'

const minProps: ComponentProps<typeof AvailableIntentItem> = {
    messageId: 1,
    option: {
        key: 'discount/request',
        label: 'discount/request',
        description: 'A request for a discount',
    },
    tooltipContainer: 'body',
    onConfirm: _noop,
    isDisabled: false,
}

describe('<AvailableIntentItem/>', () => {
    it('should display the available intent with an enable add button', () => {
        const {container} = render(<AvailableIntentItem {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display the available intent with an disabled add button and a tooltip', () => {
        const {container} = render(
            <AvailableIntentItem {...minProps} isDisabled={true} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
