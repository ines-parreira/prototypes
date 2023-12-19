import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {AgentsEditColumnsItem} from 'pages/stats/AgentsEditColumnsItem'

describe('<AgentsEditColumnsItem>', () => {
    const title = 'item title'
    const minProps: ComponentProps<typeof AgentsEditColumnsItem> = {
        title,
        isChecked: false,
        onChange: (v) => v,
    }

    it('should render dropdown item', () => {
        render(<AgentsEditColumnsItem {...minProps} />)

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should render disabled dropdown item', () => {
        const {container} = render(
            <AgentsEditColumnsItem {...minProps} disabled />
        )

        expect(container.firstChild).toHaveClass('disabled')
    })

    it('should render tooltip on hover dropdown item', async () => {
        const tooltip = 'test tooltip'
        render(<AgentsEditColumnsItem {...minProps} tooltip={tooltip} />)

        fireEvent.mouseOver(screen.getByText('info'))

        expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltip)
    })

    it('should call onChange on clicking', () => {
        const onChange = jest.fn()
        render(<AgentsEditColumnsItem {...minProps} onChange={onChange} />)

        fireEvent.click(screen.getByText(title))

        expect(onChange).toBeCalledWith(!minProps.isChecked)
    })
})
