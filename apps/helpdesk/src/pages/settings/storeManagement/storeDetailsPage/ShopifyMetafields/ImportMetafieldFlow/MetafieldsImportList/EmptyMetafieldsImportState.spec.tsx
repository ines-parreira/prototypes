import React from 'react'

import { render, screen } from '@testing-library/react'

import EmptyMetafieldsImportState from './EmptyMetafieldsImportState'

describe('EmptyMetafieldsImportState', () => {
    it('should render the heading', () => {
        render(<EmptyMetafieldsImportState />)

        expect(
            screen.getByRole('heading', { name: /no metafields available/i }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        render(<EmptyMetafieldsImportState />)

        expect(
            screen.getByText(
                /there are no metafields available to import in this category/i,
            ),
        ).toBeInTheDocument()
    })
})
