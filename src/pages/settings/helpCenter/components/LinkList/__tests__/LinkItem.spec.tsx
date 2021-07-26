import React from 'react'
import {render} from '@testing-library/react'

import {LinkItem} from '../LinkItem'

describe('<LinkItem>', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <LinkItem
                id={1}
                value="https://test.com"
                label="Test link"
                onBlur={jest.fn}
                onDelete={jest.fn}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('displays error if value is empty and label is not', () => {
        const {getByText} = render(
            <LinkItem
                id={1}
                value=""
                label="Test link"
                onBlur={jest.fn}
                onDelete={jest.fn}
            />
        )

        getByText('Please enter a valid URL')
    })

    it('displays error if label is empty and value is not', () => {
        const {getByText} = render(
            <LinkItem
                id={1}
                value="https://test.com"
                label=""
                onBlur={jest.fn}
                onDelete={jest.fn}
            />
        )

        getByText('Please enter a valid title')
    })
})
