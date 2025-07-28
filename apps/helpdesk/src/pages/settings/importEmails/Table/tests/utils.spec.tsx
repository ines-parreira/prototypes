import { render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'

import { EmailProviderType } from '../../types'
import { getProviderIcon, getStatusBadge } from '../utils'

describe('utils', () => {
    describe('getProviderIcon', () => {
        it('returns Gmail icon for Gmail provider', () => {
            const result = getProviderIcon(IntegrationType.Gmail)

            render(<div>{result}</div>)

            expect(screen.getByAltText('gmail logo')).toBeInTheDocument()
        })

        it('returns Outlook icon for Outlook provider', () => {
            const result = getProviderIcon(IntegrationType.Outlook)

            render(<div>{result}</div>)

            expect(screen.getByAltText('outlook logo')).toBeInTheDocument()
        })

        it('returns default email icon for unsupported provider', () => {
            const result = getProviderIcon(
                'UnsupportedProvider' as EmailProviderType,
            )

            render(<div>{result}</div>)

            expect(screen.getByText('email')).toBeInTheDocument()
        })
    })

    describe('getStatusBadge', () => {
        describe('Completed Status', () => {
            it('displays completed badge with success icon', () => {
                const result = getStatusBadge('completed', 100)

                render(<div>{result}</div>)

                expect(
                    screen.getByText('check_circle_outline'),
                ).toBeInTheDocument()
                expect(screen.getByText('COMPLETED')).toBeInTheDocument()
            })

            it('ignores progressPercentage for completed status', () => {
                const result = getStatusBadge('completed', 50)

                render(<div>{result}</div>)

                expect(screen.getByText('COMPLETED')).toBeInTheDocument()
                expect(screen.queryByText('50%')).not.toBeInTheDocument()
            })
        })

        describe('Failed Status', () => {
            it('displays failed badge with error icon', () => {
                const result = getStatusBadge('failed', 0)

                render(<div>{result}</div>)

                expect(screen.getByText('error_outline')).toBeInTheDocument()
                expect(screen.getByText('FAILED')).toBeInTheDocument()
            })

            it('ignores progressPercentage for failed status', () => {
                const result = getStatusBadge('failed', 75)

                render(<div>{result}</div>)

                expect(screen.getByText('FAILED')).toBeInTheDocument()
                expect(screen.queryByText('75%')).not.toBeInTheDocument()
            })
        })

        describe('In Progress Status', () => {
            it('displays in progress badge with percentage', () => {
                const result = getStatusBadge('in_progress', 50)

                render(<div>{result}</div>)

                expect(screen.getByText('50% COMPLETED')).toBeInTheDocument()
            })

            it('shows different progress percentages correctly', () => {
                const result25 = getStatusBadge('in_progress', 25)
                const result75 = getStatusBadge('in_progress', 75)

                render(<div>{result25}</div>)
                expect(screen.getByText('25% COMPLETED')).toBeInTheDocument()

                render(<div>{result75}</div>)
                expect(screen.getByText('75% COMPLETED')).toBeInTheDocument()
            })

            it('handles zero progress percentage', () => {
                const result = getStatusBadge('in_progress', 0)

                render(<div>{result}</div>)

                expect(screen.getByText('0% COMPLETED')).toBeInTheDocument()
            })

            it('handles full progress percentage', () => {
                const result = getStatusBadge('in_progress', 100)

                render(<div>{result}</div>)

                expect(screen.getByText('100% COMPLETED')).toBeInTheDocument()
            })
        })
    })
})
