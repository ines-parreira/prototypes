import React from 'react'

import { render, screen } from '@testing-library/react'

import { SearchResult } from '../SearchResult'

describe('SearchResult', () => {
    it('should render with only a label', () => {
        const { container } = render(
            <SearchResult label="foo" path="" value="foo" />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a label and a path', () => {
        render(<SearchResult label="foo" path="bar" value="foo" />)
        expect(screen.getByText('foo'))
        expect(screen.getByText('bar'))
    })

    it('should render with a check icon when value is equal to currentValue', () => {
        render(
            <SearchResult
                label="foo"
                path="bar"
                value="foo"
                currentValue="foo"
            />,
        )
        expect(screen.getByText('check'))
    })

    it('should render with a check icon when value is included in currentValue', () => {
        render(
            <SearchResult
                label="foo"
                path="bar"
                value="foo"
                currentValue={['foo']}
            />,
        )
        expect(screen.getByText('check'))
    })

    it('should render with a highlighted label or path when currentSearch is equal to label or path', () => {
        const { container } = render(
            <SearchResult
                label="foobar"
                path="barfoo"
                value="foob"
                currentSearch="fo"
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
