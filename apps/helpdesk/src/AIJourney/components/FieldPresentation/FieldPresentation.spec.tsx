import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

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

    it('should render tooltip properly', async () => {
        render(
            <FieldPresentation
                name={'Nice field'}
                description={'This is a nice field'}
                tooltip={'This is a tooltip'}
            />,
        )
        expect(screen.queryByText('This is a tooltip')).toBeFalsy()

        const user = userEvent.setup()
        await act(async () => {
            await user.hover(screen.getByText('info'))
        })
        expect(screen.getByText('This is a tooltip')).toBeInTheDocument()
    })

    it('should render optional decorator properly', async () => {
        render(
            <FieldPresentation
                name={'Nice field'}
                description={'This is a nice field'}
                optional
            />,
        )

        expect(screen.getByText('(optional)')).toBeInTheDocument()
    })
})
