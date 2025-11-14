import { screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import css from 'common/navigation/components/GlobalNavigationItem.less'
import { renderWithRouter } from 'utils/testing'

describe('GlobalNavigationItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an inactive item', () => {
        renderWithRouter(
            <GlobalNavigationItem icon="home" url="/app/home" label="Home" />,
        )
        expect(screen.getByText('home').parentNode).not.toHaveClass(css.active)
    })

    it('should render an active item', () => {
        renderWithRouter(
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
        renderWithRouter(
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
        renderWithRouter(
            <GlobalNavigationItem
                icon="home"
                isActive
                onClick={() => {}}
                label="Home"
            />,
        )
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
})
