import React from 'react'

import { render, screen } from '@testing-library/react'

import Status, { StatusType } from './Status'

describe('Status Component', () => {
    it('should render the correct label', () => {
        const label = 'Test Label'

        render(<Status type={StatusType.Success}>{label}</Status>)

        const statusElement = screen.getByText(label)
        expect(statusElement).toBeInTheDocument()
    })

    it('should apply the correct background color based on type', () => {
        const type = StatusType.Success

        render(<Status type={StatusType.Success}>Test Label</Status>)

        const dotElement = screen.getByText('Test Label').previousElementSibling
        expect(dotElement).toHaveStyle(`background-color: var(--dot-${type})`)
    })
})
