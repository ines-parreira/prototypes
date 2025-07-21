import React from 'react'

import { render, screen } from '@testing-library/react'

import { FieldPresentation } from './FieldPresentation'

describe('<FieldPresentation />', () => {
    it('should render name and description properly', () => {
        render(
            <FieldPresentation
                name={'Nice field'}
                description={'This is a nice field'}
            />,
        )

        expect(screen.getByText('Nice field')).toBeInTheDocument()
        expect(screen.getByText('This is a nice field')).toBeInTheDocument()
    })
})
