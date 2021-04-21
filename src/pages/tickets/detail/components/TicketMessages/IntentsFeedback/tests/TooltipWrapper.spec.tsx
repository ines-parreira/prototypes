import React, {ComponentProps} from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {TooltipWrapper} from '../TooltipWrapper'

const minProps: ComponentProps<typeof TooltipWrapper> = {
    id: 'tooltip-foo',
    tooltipContainer: 'body',
    message: 'information message',
    children: 'trigger',
}

describe('<TooltipWrapper/>', () => {
    it('should show the trigger', () => {
        const {container} = render(<TooltipWrapper {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should show the tooltip on hover when show is true', async () => {
        const {findByText} = render(
            <TooltipWrapper {...minProps} show={true} />
        )

        const trigger = screen.queryByText('trigger')
        fireEvent.mouseOver(trigger!)
        const tooltip = await findByText('information message')
        expect(tooltip).toMatchSnapshot()
    })

    it('should not show the tooltip wrapper when show is false', async () => {
        const {findByText} = render(
            <TooltipWrapper {...minProps} show={false} />
        )

        const trigger = screen.queryByText('trigger')
        fireEvent.mouseOver(trigger!)
        try {
            await findByText('information message')
        } catch {
            const tooltip = screen.queryAllByText('information message')
            expect(tooltip.length).toBe(0)
        }
    })
})
