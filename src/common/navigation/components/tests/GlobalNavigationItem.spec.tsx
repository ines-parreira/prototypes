import React from 'react'

import { render, screen } from '@testing-library/react'

import GlobalNavigationItem from '../GlobalNavigationItem'

import css from '../GlobalNavigationItem.less'

describe('GlobalNavigationItem', () => {
    it('should render an inactive item', () => {
        render(<GlobalNavigationItem icon="home" url="/app/home" />)
        expect(screen.getByText('home').parentNode).not.toHaveClass(css.active)
    })

    it('should render an active item', () => {
        render(<GlobalNavigationItem icon="home" isActive url="/app/home" />)
        expect(screen.getByText('home').parentNode).toHaveClass(css.active)
    })
    it('should render an link item', () => {
        render(<GlobalNavigationItem icon="home" isActive url="/app/home" />)
        expect(screen.getByText('home').closest('a')).toBeInTheDocument()
    })
    it('should render an button item', () => {
        render(<GlobalNavigationItem icon="home" isActive onClick={() => {}} />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
})
