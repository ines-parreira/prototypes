import React from 'react'
import {render} from '@testing-library/react'

import TemplateCardLink from '../TemplateCardLink'

describe('<TemplateCardLink />', () => {
    const props = {
        description:
            'Ask customers questions and recommend specific products based on their answers.',
        title: 'Product recommendation',
        to: 'path_to_template',
    }

    it('should display a template card with specific style', () => {
        const {getByText} = render(<TemplateCardLink {...props} />)

        expect(getByText(props.title).closest('a')).toHaveAttribute(
            'to',
            props.to
        )
        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })
})
