import {render} from '@testing-library/react'
import React from 'react'

import AutoQA from '../AutoQA'

describe('AutoQA', () => {
    it('should render the component', () => {
        const {getByText} = render(<AutoQA />)
        expect(getByText('Auto QA Score')).toBeInTheDocument()
    })
})
