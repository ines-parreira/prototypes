import React from 'react'

import { render, screen } from '@testing-library/react'

import EmptyMetafieldsState from '../EmptyMetafieldsState'

describe('EmptyMetafieldsState', () => {
    it('should render the heading correctly', () => {
        const handleOpenCategoriesModal = jest.fn()
        render(
            <EmptyMetafieldsState
                handleOpenCategoriesModal={handleOpenCategoriesModal}
            />,
        )

        expect(
            screen.getByText(/Once you import them, you can manage them here/i),
        ).toBeInTheDocument()

        const heading = screen.getByRole('heading')
        expect(heading).toBeInTheDocument()

        const importButton = screen.getByRole('button', { name: /import/i })
        expect(importButton).toBeInTheDocument()
    })
})
