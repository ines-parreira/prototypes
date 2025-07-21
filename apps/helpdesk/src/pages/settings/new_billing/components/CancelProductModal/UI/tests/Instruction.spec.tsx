import React from 'react'

import { render } from '@testing-library/react'

import Instruction from '../Instruction'

describe('Instruction', () => {
    it('renders with required instruction', () => {
        const { getByText, queryByText } = render(
            <Instruction isRequired={true}>Some required text.</Instruction>,
        )

        const instructionText = getByText('Some required text.')
        const asterisk = queryByText('*')
        expect(instructionText).toBeInTheDocument()
        expect(asterisk).toBeInTheDocument()
    })

    it('renders with optional instruction', () => {
        const { getByText, queryByText } = render(
            <Instruction isRequired={false}>Some optional text.</Instruction>,
        )

        const instructionText = getByText('Some optional text.')
        const asterisk = queryByText('*')
        expect(instructionText).toBeInTheDocument()
        expect(asterisk).toBeNull()
    })
})
