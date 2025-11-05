import { render, screen } from '@testing-library/react'

import MaxFieldsImportedBanner from './MaxFieldsImportedBanner'

describe('MaxFieldsImportedBanner', () => {
    it('should render info banner with correct message', () => {
        render(<MaxFieldsImportedBanner />)

        expect(
            screen.getByText(
                /maximum number of metafields imported\. remove one from your list in the table before importing a new one\./i,
            ),
        ).toBeInTheDocument()
    })
})
