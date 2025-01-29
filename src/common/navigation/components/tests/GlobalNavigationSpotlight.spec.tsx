import {fireEvent, render, waitFor, act} from '@testing-library/react'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {SpotlightContext} from 'providers/ui/SpotlightContext'

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

    it('should show tooltip on focus when spotlight is closed', () => {
        const {getByRole} = render(
            <SpotlightContext.Provider
                value={{isOpen: false, setIsOpen: jest.fn()}}
            >
                <GlobalNavigationSpotlight />
            </SpotlightContext.Provider>
        )
        const button = getByRole('button')

        fireEvent.focus(button)
        expect(getByRole('tooltip')).toBeInTheDocument()
    })

    it('should not show tooltip on focus when spotlight is open', () => {
        const {getByRole, queryByRole} = render(
            <SpotlightContext.Provider
                value={{isOpen: true, setIsOpen: jest.fn()}}
            >
                <GlobalNavigationSpotlight />
            </SpotlightContext.Provider>
        )
        const button = getByRole('button')

        fireEvent.focus(button)
        expect(queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('should restore default tooltip triggers after spotlight closes', () => {
        jest.useFakeTimers()
        const setIsOpen = jest.fn()
        const {getByRole, rerender} = render(
            <SpotlightContext.Provider value={{isOpen: true, setIsOpen}}>
                <GlobalNavigationSpotlight />
            </SpotlightContext.Provider>
        )

        // Re-render with spotlight closed
        rerender(
            <SpotlightContext.Provider value={{isOpen: false, setIsOpen}}>
                <GlobalNavigationSpotlight />
            </SpotlightContext.Provider>
        )

        act(() => {
            jest.advanceTimersByTime(500)
        })

        const button = getByRole('button')
        fireEvent.focus(button)
        expect(getByRole('tooltip')).toBeInTheDocument()

        jest.useRealTimers()
    })
})
