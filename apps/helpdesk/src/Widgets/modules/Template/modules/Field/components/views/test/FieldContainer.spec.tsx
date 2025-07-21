import React from 'react'

import { render, screen } from '@testing-library/react'

import FieldContainer from '../FieldContainer'

describe('<FieldContainer/>', () => {
    it('should add the `fieldContainer` class while preserving provided one', () => {
        const additionalClass = 'additionalClass'
        const content = 'content'
        render(
            <FieldContainer className={additionalClass}>
                content
            </FieldContainer>,
        )

        const container = screen.getByText(content)

        expect(container.classList.contains('fieldContainer')).toBeTruthy()
        expect(container.classList.contains(additionalClass)).toBeTruthy()
    })
})
