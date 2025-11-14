import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CustomCardLink from '../CustomCardLink'

describe('<CustomCardLink />', () => {
    const props = {
        description: 'Create a custom Flow from scratch to fit your needs',
        title: 'Custom flow',
        to: 'path_to_custom',
    }

    it('should display a custom card wrapped in a link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <CustomCardLink {...props} />
            </MemoryRouter>,
        )

        expect(getByText(props.title).closest('a')).toHaveAttribute(
            'href',
            `/${props.to}`,
        )
        expect(getByText('add_circle')).toBeInTheDocument()
        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })
})
