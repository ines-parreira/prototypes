import {render, screen} from '@testing-library/react'
import React from 'react'

import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

describe('<NoDataAvailable>', () => {
    it('should render', () => {
        render(<NoDataAvailable title="Title" description="Description" />)

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
    })
})
