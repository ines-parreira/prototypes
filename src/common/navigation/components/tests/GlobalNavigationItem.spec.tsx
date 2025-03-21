import React from 'react'

import { render, screen } from '@testing-library/react'

import GlobalNavigationItem from 'common/navigation/components/GlobalNavigationItem'
import css from 'common/navigation/components/GlobalNavigationItem.less'

describe('GlobalNavigationItem', () => {
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
                url="/app/home"
                label="Home"
            />,
        )
        expect(screen.getByText('home').parentNode).toHaveClass(css.active)
    })

    it('should render an link item', () => {
        render(
            <GlobalNavigationItem
                icon="home"
                isActive
                url="/app/home"
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
})
