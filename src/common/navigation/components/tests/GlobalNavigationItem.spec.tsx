import { render, screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import css from 'common/navigation/components/GlobalNavigationItem.less'
import { useFlag } from 'core/flags'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

describe('GlobalNavigationItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an inactive item', () => {
        render(
            <GlobalNavigationItem icon="home" url="/app/home" label="Home" />,
        )
        expect(screen.getByText('home').parentNode).not.toHaveClass(css.active)
    })

    it('should render an active item', () => {
        render(
            <GlobalNavigationItem
                icon="home"
                isActive
                to="/app/home"
                label="Home"
            />,
        )
        expect(screen.getByText('home').parentNode).toHaveClass(css.active)
    })

    it('should render an link item', () => {
        render(
            <GlobalNavigationItem
                as={Link}
                icon="home"
                isActive
                to="/app/home"
                label="Home"
            />,
        )
        expect(screen.getByText('home').closest('a')).toBeInTheDocument()
    })

    it('should render an button item', () => {
        render(
            <GlobalNavigationItem
                icon="home"
                isActive
                onClick={() => {}}
                label="Home"
            />,
        )
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should apply correct className based on UI version and active state', () => {
        ;(useFlag as jest.Mock).mockReturnValue(true)
        const { rerender } = render(
            <GlobalNavigationItem icon="home" isActive label="Home" />,
        )
        expect(screen.getByText('home').parentNode).toHaveClass(css.iconV2)
        expect(screen.getByText('home').parentNode).toHaveClass(css.activeV2)
        ;(useFlag as jest.Mock).mockReturnValue(false)
        rerender(<GlobalNavigationItem icon="home" isActive label="Home" />)
        expect(screen.getByText('home').parentNode).toHaveClass(css.icon)
        expect(screen.getByText('home').parentNode).toHaveClass(css.active)
    })
})
