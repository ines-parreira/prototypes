import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import * as platform from '@repo/utils'
import { fireEvent, render, waitFor } from '@testing-library/react'

import Button from '../SpotlightButton'

jest.mock('@repo/logging')

describe('<SpotlightSearchButton />', () => {
    it('should render a search button', () => {
        const { container } = render(<Button />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tooltip on button hover on mac', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const { getByRole } = render(<Button />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toMatchSnapshot()
        })
    })

    it('should render a tooltip on button hover on other systems', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })
        const { getByRole } = render(<Button />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toMatchSnapshot()
        })
    })

    it('should log an event when the button is clicked', () => {
        const { getByRole } = render(<Button />)
        fireEvent.click(getByRole('button'))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchOpenButtonClick,
        )
    })
})
