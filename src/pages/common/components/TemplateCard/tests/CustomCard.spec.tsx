import {render} from '@testing-library/react'
import React from 'react'

import CustomCard from '../CustomCard'

describe('<CustomCard />', () => {
    const props = {
        description: 'Create a custom Flow from scratch to fit your needs',
        title: 'Custom flow',
    }

    it('should display a custom card', () => {
        const {getByText} = render(<CustomCard {...props} />)

        expect(getByText('add_circle')).toBeInTheDocument()
        expect(getByText(props.description)).toBeInTheDocument()
        expect(getByText(props.title)).toBeInTheDocument()
    })
})
