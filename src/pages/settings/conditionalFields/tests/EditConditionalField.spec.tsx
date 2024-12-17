import {render, screen} from '@testing-library/react'
import React from 'react'
import {Link} from 'react-router-dom'

import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import EditConditionalField from '../EditConditionalField'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(() => <></>),
            useParams: () => ({id: 10}),
        }) as Record<string, unknown>
)

describe('EditConditionalField', () => {
    it('should set a page title', () => {
        render(<EditConditionalField />)

        expect(document.title).toEqual('Condition')
        expect(screen.getByText('Condition 10')).toBeInTheDocument()
    })

    it('should render a link to Field Conditions', () => {
        render(<EditConditionalField />)

        expect(Link).toHaveBeenCalledWith(
            {
                to: `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/`,
                children: 'Field Conditions',
            },
            {}
        )
    })
})
