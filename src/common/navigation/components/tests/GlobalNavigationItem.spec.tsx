import { render, screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import css from 'common/navigation/components/GlobalNavigationItem.less'

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

    it('should render an image icon', () => {
        render(
            <GlobalNavigationItem
                icon={<img src="src/test" alt="test-img" />}
                label="Home"
            />,
        )

        expect(screen.getByAltText('test-img')).toBeInTheDocument()
    })
})
