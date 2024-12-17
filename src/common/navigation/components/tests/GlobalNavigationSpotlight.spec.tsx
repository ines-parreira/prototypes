import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import * as platform from 'utils/platform'

import {GlobalNavigationSpotlight} from '../GlobalNavigationSpotlight'

jest.mock('common/segment')

describe('<GlobalNavigationSpotlight />', () => {
    it('should render a tooltip on button hover on mac', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const {getByRole} = render(<GlobalNavigationSpotlight />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toHaveTextContent('Global search⌘k')
        })
    })

    it('should render a tooltip on button hover on other systems', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })
        const {getByRole} = render(<GlobalNavigationSpotlight />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toHaveTextContent('Global searchctrlk')
        })
    })

    it('should log an event when the button is clicked', () => {
        const {getByRole} = render(<GlobalNavigationSpotlight />)
        fireEvent.click(getByRole('button'))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchOpenButtonClick
        )
    })
})
