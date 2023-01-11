import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import * as platform from 'utils/platform'

import Button from '../SpotlightButton'

describe('<SpotlightSearchButton />', () => {
    it('should render a search button', () => {
        const {container} = render(<Button />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tooltip on button hover on mac', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const {getByRole} = render(<Button />)
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
        const {getByRole} = render(<Button />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toMatchSnapshot()
        })
    })
})
