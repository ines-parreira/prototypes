import React from 'react'

import { render, screen } from '@testing-library/react'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'

describe('<NoDataAvailable>', () => {
    it('should render', () => {
        render(<NoDataAvailable title="Title" description="Description" />)

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
    })
})
