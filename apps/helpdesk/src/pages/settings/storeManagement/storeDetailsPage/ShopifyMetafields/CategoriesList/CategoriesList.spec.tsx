import React from 'react'

import { render, screen } from '@testing-library/react'

import CategoriesList from './CategoriesList'

describe('CategoriesList', () => {
    it('should render the component without crashing', () => {
        render(<CategoriesList />)

        expect(screen.getByText('Customers')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('Draft Orders')).toBeInTheDocument()
    })

    it('should display select count when greater than 0', () => {
        render(<CategoriesList />)

        expect(screen.getByText('5 selected')).toBeInTheDocument()
    })
})
