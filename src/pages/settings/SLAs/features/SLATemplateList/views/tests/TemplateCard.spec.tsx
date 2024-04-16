import React from 'react'
import {render} from '@testing-library/react'

import TemplateCard from '../TemplateCard'
import {TEMPLATES_LIST} from '../config'

describe('<TemplateCard />', () => {
    it('should display a template card', () => {
        const props = {
            template: TEMPLATES_LIST[0],
            to: 'path_to_template',
        }
        const {getByText} = render(<TemplateCard {...props} />)

        expect(getByText(/Use template/i)).toBeInTheDocument()
        expect(getByText(props.template.name)).toBeInTheDocument()
        expect(getByText(props.template.description)).toBeInTheDocument()

        expect(getByText(/use template/i).closest('a')).toHaveAttribute(
            'to',
            props.to
        )
    })
})
