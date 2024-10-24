import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import IconButtonTooltip from '../IconButtonTooltip'

jest.mock(
    'pages/common/components/button/IconButton',
    () =>
        ({children, ...rest}: any) => <div {...rest}>{children}</div>
)

describe('<IconButtonTooltip />', () => {
    it('should render the button only', () => {
        const {getByTestId, queryByText} = render(
            <IconButtonTooltip data-testid="icon-button-tooltip" icon="pause">
                Tooltip text
            </IconButtonTooltip>
        )

        expect(getByTestId('icon-button-tooltip')).toBeInTheDocument()
        expect(queryByText('Tooltip text')).not.toBeInTheDocument()
    })

    it('should render the tooltip when hovering over the button', async () => {
        const {getByTestId, getByText} = render(
            <IconButtonTooltip data-testid="icon-button-tooltip" icon="pause">
                Tooltip text
            </IconButtonTooltip>
        )

        const button = getByTestId('icon-button-tooltip')
        fireEvent.mouseOver(button)

        await waitFor(() =>
            expect(getByText('Tooltip text')).toBeInTheDocument()
        )
    })

    it('should hide the tooltip when moving the mouse away from the button', async () => {
        const {getByTestId, queryByText} = render(
            <IconButtonTooltip data-testid="icon-button-tooltip" icon="pause">
                Tooltip text
            </IconButtonTooltip>
        )

        const button = getByTestId('icon-button-tooltip')
        fireEvent.mouseOver(button)
        fireEvent.mouseOut(button)

        await waitFor(() =>
            expect(expect(queryByText('Tooltip text')).toBeNull())
        )
    })
})
