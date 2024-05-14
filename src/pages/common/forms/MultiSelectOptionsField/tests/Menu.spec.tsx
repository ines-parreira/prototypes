import _noop from 'lodash/noop'
import React from 'react'

import {render, screen} from '@testing-library/react'
import Menu from 'pages/common/forms/MultiSelectOptionsField/Menu'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

describe('MultiSelectField Menu', () => {
    const options: Option[] = [
        {
            value: 'foo',
            label: 'Foo',
        },
        {
            value: 'bar',
            label: 'Bar',
            displayLabel: <span>BarSpan</span>,
        },
    ]

    const defaultProps = {
        options,
        activeIndex: 0,
        onActivate: _noop,
        onSelect: _noop,
    }

    it('should render displayLabel first and label as a fallback', () => {
        const {container} = render(<Menu {...defaultProps} />)

        expect(container.firstChild?.textContent).toBe('Foo')
        expect(container.lastChild?.textContent).toBe('BarSpan')
    })

    it('should display loading spinner if loading set to true', () => {
        render(<Menu {...defaultProps} isLoading />)

        expect(document.querySelector('.material-icons')?.textContent).toEqual(
            'refresh'
        )
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should display "No result" if not loading and no options', () => {
        render(<Menu {...defaultProps} options={[]} />)

        expect(screen.getByText('No result')).toBeInTheDocument()
    })
})
