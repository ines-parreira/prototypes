import React from 'react'

import { render, screen } from '@testing-library/react'

import ActionStatus from '../ActionsStatus'

describe('ActionStatus Component', () => {
    it('should render SUCCESS badge when status is success', () => {
        render(<ActionStatus status="success" />)
        const badge = screen.getByText('SUCCESS')
        expect(badge).toBeInTheDocument()
    })

    it('should render PARTIAL SUCCESS badge when status is partial_success', () => {
        render(<ActionStatus status="partial_success" />)
        const badge = screen.getByText('PARTIAL SUCCESS')
        expect(badge).toBeInTheDocument()
    })

    it('should render ERROR badge when status is error', () => {
        render(<ActionStatus status="error" />)
        const badge = screen.getByText('ERROR')
        expect(badge).toBeInTheDocument()
    })

    it('should render SUCCESS badge when successFlag is true', () => {
        render(<ActionStatus successFlag={true} status={undefined} />)
        const badge = screen.getByText('SUCCESS')
        expect(badge).toBeInTheDocument()
    })

    it('should render ERROR badge when successFlag is false', () => {
        render(<ActionStatus successFlag={false} status={undefined} />)
        const badge = screen.getByText('ERROR')
        expect(badge).toBeInTheDocument()
    })

    it('should render nothing when there is no status and successFlag is undefined', () => {
        render(<ActionStatus status={undefined} />)
        const badge = screen.queryByText('SUCCESS')
        expect(badge).toBeNull()
    })

    it('should render nothing when status is invalid', () => {
        render(<ActionStatus status={undefined} />)
        const badge = screen.queryByText('SUCCESS')
        expect(badge).toBeNull()
    })
})
