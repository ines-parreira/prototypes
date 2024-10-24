import {getByText, render} from '@testing-library/react'
import _noop from 'lodash/noop'
import React from 'react'

import Tag from '../Tag'
import {Option} from '../types'

describe('multi select options field tag', () => {
    const option: Option = {
        value: 'foo',
        label: 'Foo',
        displayLabel: <span>FooLabel</span>,
    }

    const defaultOptions = {
        option,
        color: '#f00',
        onRemove: _noop,
    }

    it('should display displayLabel first and label as a fallback', () => {
        const {container, rerender} = render(<Tag {...defaultOptions} />)

        expect(container).toHaveTextContent(/FooLabel/i)
        rerender(
            <Tag {...defaultOptions} option={{...option, displayLabel: ''}} />
        )
        expect(container).toHaveTextContent(/Foo/i)
    })

    it('should add symbol spaces if symbolSpaces is true', () => {
        const {container} = render(
            <Tag
                {...defaultOptions}
                option={{...option, displayLabel: '', label: 'what is up'}}
                symbolSpaces
            />
        )

        expect(container).toHaveTextContent(/what␣is␣up/i)
    })

    it('should invoke onRemove when remove button is clicked', () => {
        const onRemove = jest.fn()
        const {container} = render(
            <Tag {...defaultOptions} onRemove={onRemove} />
        )

        getByText(container, /close/i).click()

        expect(onRemove).toHaveBeenCalled()
    })
})
