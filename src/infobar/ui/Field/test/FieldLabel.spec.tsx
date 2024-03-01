import React from 'react'
import {render, screen} from '@testing-library/react'

import FieldLabel from '../FieldLabel'

describe('<FieldLabel/>', () => {
    it('should add the `fieldLabel` class while preserving provided one', () => {
        const additionalClass = 'additionalClass'
        const content = 'content'
        render(<FieldLabel className={additionalClass}>content</FieldLabel>)

        const valueEl = screen.getByText(content)

        expect(valueEl.classList.contains('fieldLabel')).toBeTruthy()
        expect(valueEl.classList.contains(additionalClass)).toBeTruthy()
    })

    it('should add the `isDisabled` class when `isDisabled` is true', () => {
        render(<FieldLabel isDisabled>content</FieldLabel>)

        const valueEl = screen.getByText('content')

        expect(valueEl.classList.contains('isDisabled')).toBeTruthy()
    })
})
