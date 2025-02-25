import React from 'react'

import { render, screen } from '@testing-library/react'

import FieldValue from '../FieldValue'

describe('<FieldValue/>', () => {
    it('should add the `fieldValue` class while preserving provided one', () => {
        const additionalClass = 'additionalClass'
        const content = 'content'
        render(<FieldValue className={additionalClass}>content</FieldValue>)

        const valueEl = screen.getByText(content)

        expect(valueEl.classList.contains('fieldValue')).toBeTruthy()
        expect(valueEl.classList.contains(additionalClass)).toBeTruthy()
    })

    it('should add the `isDisabled` class when `isDisabled` is true', () => {
        render(<FieldValue isDisabled>content</FieldValue>)

        const valueEl = screen.getByText('content')

        expect(valueEl.classList.contains('isDisabled')).toBeTruthy()
    })

    it('should add the `isNotBold` class when `isNotBold` is true', () => {
        render(<FieldValue isNotBold>content</FieldValue>)

        const valueEl = screen.getByText('content')

        expect(valueEl.classList.contains('isNotBold')).toBeTruthy()
    })

    it('should add the `overflow` class when `canOverflow` is true', () => {
        render(<FieldValue canOverflow>content</FieldValue>)

        const valueEl = screen.getByText('content')

        expect(valueEl.classList.contains('overflow')).toBeTruthy()
    })
})
