import {render, screen} from '@testing-library/react'
import React from 'react'
import {Link} from 'react-router-dom'

import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import AddConditionalField from '../AddConditionalField'

jest.mock('../ThenField', () => () => <div>ThenField</div>)
jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(() => <></>),
        }) as Record<string, unknown>
)

describe('AddConditionalField', () => {
    it('should set a page title', () => {
        render(<AddConditionalField />)

        expect(document.title).toEqual('Create condition')
        expect(screen.getByText('Create condition')).toBeInTheDocument()
    })

    it('should render a link to Field Conditions', () => {
        render(<AddConditionalField />)

        expect(Link).toHaveBeenCalledWith(
            {
                to: `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/`,
                children: 'Field Conditions',
            },
            {}
        )
    })
})
