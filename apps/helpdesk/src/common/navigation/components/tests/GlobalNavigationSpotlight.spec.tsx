import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import * as platform from '@repo/utils'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GlobalNavigationSpotlight } from 'common/navigation/components/GlobalNavigationSpotlight'

jest.mock('@repo/logging')

describe('<GlobalNavigationSpotlight />', () => {
    it('should render a tooltip on button hover on mac', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const { getByRole } = render(<GlobalNavigationSpotlight />)
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
        const { getByRole } = render(<GlobalNavigationSpotlight />)
        fireEvent.mouseOver(getByRole('button'))

        await waitFor(() => {
            expect(getByRole('tooltip')).toHaveTextContent('Global searchctrlk')
        })
    })

    it('should log an event when the button is clicked', () => {
        const { getByRole } = render(<GlobalNavigationSpotlight />)
        fireEvent.click(getByRole('button'))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchOpenButtonClick,
        )
    })
})
