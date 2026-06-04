import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { GlobalNavigationSpotlight } from 'common/navigation/components/GlobalNavigationSpotlight'
import { SpotlightContext } from 'providers/ui/SpotlightContext'

let mockIsMacOs = false

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    get isMacOs() {
        return mockIsMacOs
    },
}))

jest.mock('@repo/logging')

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <SpotlightContext.Provider value={{ isOpen: false, setIsOpen: jest.fn() }}>
        {children}
    </SpotlightContext.Provider>
)

describe('<GlobalNavigationSpotlight />', () => {
    beforeEach(() => {
        mockIsMacOs = false
    })

    it('should render a tooltip on button hover on mac', async () => {
        mockIsMacOs = true
        const { user } = render(<GlobalNavigationSpotlight />, { wrapper })

        await user.hover(screen.getByRole('button', { name: 'Global search' }))

        expect(
            await screen.findByRole('tooltip', undefined, { timeout: 2000 }),
        ).toHaveTextContent('Global search⌘k')
    })

    it('should render a tooltip on button hover on other systems', async () => {
        const { user } = render(<GlobalNavigationSpotlight />, { wrapper })

        await user.hover(screen.getByRole('button', { name: 'Global search' }))

        expect(
            await screen.findByRole('tooltip', undefined, { timeout: 2000 }),
        ).toHaveTextContent('Global searchctrlk')
    })

    it('should log an event when the button is clicked', () => {
        const { getByRole } = render(<GlobalNavigationSpotlight />, { wrapper })
        fireEvent.click(getByRole('button'))
    })
})
