import React from 'react'
import {render} from '@testing-library/react'

import TemplateCard from '../TemplateCard'

describe('<TemplateCard />', () => {
    const props = {
        description:
            'Ask customers questions and recommend specific products based on their answers.',
        title: 'Product recommendation',
    }

    it('should display a template card with specific style', () => {
        const {container, getByText} = render(<TemplateCard {...props} />)

        expect(container.firstChild).toHaveClass('templateCard')
        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })
})
