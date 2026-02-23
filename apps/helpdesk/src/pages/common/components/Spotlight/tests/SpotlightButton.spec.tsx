import { logEvent, SegmentEvent } from '@repo/logging'
import * as platform from '@repo/utils'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpotlightContext } from 'providers/ui/SpotlightContext'

import Button from '../SpotlightButton'

jest.mock('@repo/logging')

describe('<SpotlightSearchButton />', () => {
    const mockSetIsOpen = jest.fn()

    const renderButton = (isOpen = false) => {
        return render(
            <SpotlightContext.Provider
                value={{ isOpen, setIsOpen: mockSetIsOpen }}
            >
                <Button />
            </SpotlightContext.Provider>,
        )
    }

    beforeEach(() => {
        mockSetIsOpen.mockClear()
    })

    it('should render a search button with correct label', () => {
        const { getByRole } = renderButton()
        const button = getByRole('button', { name: /search/i })

        expect(button).toBeInTheDocument()
    })

    it('should render a tooltip on button hover on mac', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: true,
            writable: true,
        })
        const user = userEvent.setup()
        const { getByRole } = renderButton()

        await user.hover(getByRole('button', { name: /search/i }))

        await waitFor(() => {
            const tooltip = getByRole('tooltip')
            expect(tooltip).toHaveTextContent('Global search')
            expect(tooltip).toHaveTextContent('⌘')
            expect(tooltip).toHaveTextContent('k')
        })
    })

    it('should render a tooltip on button hover on other systems', async () => {
        Object.defineProperty(platform, 'isMacOs', {
            value: false,
            writable: true,
        })
        const user = userEvent.setup()
        const { getByRole } = renderButton()

        await user.hover(getByRole('button', { name: /search/i }))

        await waitFor(() => {
            const tooltip = getByRole('tooltip')
            expect(tooltip).toHaveTextContent('Global search')
            expect(tooltip).toHaveTextContent('ctrl')
            expect(tooltip).toHaveTextContent('k')
        })
    })

    it('should log an event and toggle spotlight when the button is clicked', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderButton(false)

        await user.click(getByRole('button', { name: /search/i }))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchOpenButtonClick,
        )
        expect(mockSetIsOpen).toHaveBeenCalledWith(true)
    })

    it('should toggle spotlight to closed when button is clicked while open', async () => {
        const user = userEvent.setup()
        const { getByRole } = renderButton(true)

        await user.click(getByRole('button', { name: /search/i }))

        expect(mockSetIsOpen).toHaveBeenCalledWith(false)
    })
})
