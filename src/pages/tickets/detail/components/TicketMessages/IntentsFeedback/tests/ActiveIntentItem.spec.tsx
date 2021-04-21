import React, {ComponentProps} from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import _noop from 'lodash/noop'

import {ActiveIntentItem} from '../ActiveIntentItem'
import {Messages} from '../constants'

const minProps: ComponentProps<typeof ActiveIntentItem> = {
    messageId: 1,
    option: {
        key: 'discount/request',
        label: 'discount/request',
        description: 'A request for a discount',
    },
    tooltipContainer: 'body',
    isConfirmed: false,
    isConfirmable: false,
    onConfirm: _noop,
    onReject: _noop,
}

describe('<ActiveIntentItem/>', () => {
    it('should display the active intent with only the reject button', () => {
        const {container} = render(<ActiveIntentItem {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display active intent item with the confirmed icon and the reject button', async () => {
        const {container, findByText} = render(
            <ActiveIntentItem {...minProps} isConfirmed={true} />
        )
        expect(container.firstChild).toMatchSnapshot()
        const tooltipTrigger = screen.queryByText('check_circle_outline')
        fireEvent.mouseOver(tooltipTrigger!)
        const tooltip = await findByText(Messages.TOOLTIP_CONFIRMED_INFO)
        expect(tooltip).toMatchSnapshot()
    })
    it('should display active intent item with the confirm and reject buttons', () => {
        const {container} = render(
            <ActiveIntentItem {...minProps} isConfirmable={true} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
