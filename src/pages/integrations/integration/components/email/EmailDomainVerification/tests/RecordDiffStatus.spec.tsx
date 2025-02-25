import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmailDNSRecord } from '@gorgias/api-queries'

import RecordDiffStatus from '../components/RecordDiffStatus'

jest.mock(
    '../components/CharDiff',
    () =>
        ({ string1, string2 }: { string1: string; string2: string }) => (
            <div>
                <p>{string1}</p>
                <p>{string2}</p>
            </div>
        ),
)

const renderComponent = (record: EmailDNSRecord) => {
    return render(<RecordDiffStatus record={record} />)
}

describe('EmailDomainVerificationDiffStatus', () => {
    it('renders Missing value badge when currentValues is empty', () => {
        renderComponent({
            current_values: [],
            value: 'example.com',
            verified: false,
        })

        const badge = screen.getByText('Missing value')

        expect(badge).toBeInTheDocument()
        expect(badge).toHaveStyle({ color: new RegExp('light-dark') })
    })

    it('renders Verified badge when isVerified is true', () => {
        renderComponent({
            current_values: ['example.com'],
            value: 'example.com',
            verified: true,
        })

        const badge = screen.getByText('Verified')

        expect(badge).toBeInTheDocument()
        expect(badge).toHaveStyle({ color: new RegExp('success') })
    })

    it('joins currentValues before comparing', () => {
        renderComponent({
            current_values: ['example.com', 'example.org'],
            value: 'example.com',
            verified: false,
        })

        expect(
            screen.getByText(/example\.com,\s*example\.org/),
        ).toBeInTheDocument()
    })

    describe('Mismatch', () => {
        it('renders Mismatch badge and CharDiff when currentValues does not match requiredValue', () => {
            renderComponent({
                current_values: ['example.org'],
                value: 'example.com',
                verified: false,
            })

            const badge = screen.getByText('Mismatch')

            expect(badge).toBeInTheDocument()
            expect(badge).toHaveStyle({ color: new RegExp('light-error') })
            expect(screen.getByText('example.com')).toBeInTheDocument()
            expect(screen.getByText('example.org')).toBeInTheDocument()
        })

        it('renders tooltip with single value mismatch message when there is a single current value', async () => {
            renderComponent({
                current_values: ['example.org'],
                value: 'example.com',
                verified: false,
            })

            userEvent.hover(screen.getByText('error_outline'))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "The value you entered doesn't match the record. Copy and paste the value into your DNS settings to avoid errors.",
                    ),
                ).toBeInTheDocument()
            })
        })

        it('renders tooltip with multiple values mismatch message when there are multiple current values', async () => {
            renderComponent({
                current_values: ['example.org', 'example.net'],
                value: 'example.com',
                verified: false,
            })

            userEvent.hover(screen.getByText('error_outline'))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Detected multiple values. Add the correct value as a single DNS record.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('truncates currentValues to 250 characters', () => {
            renderComponent({
                current_values: ['a'.repeat(300)],
                value: 'b'.repeat(300),
                verified: false,
            })

            expect(screen.getByText('a'.repeat(250))).toBeInTheDocument()
            expect(screen.getByText('...')).toBeInTheDocument()
        })

        it('does not append "..." when currentValues is less than 250 characters', () => {
            renderComponent({
                current_values: ['a'.repeat(200)],
                value: 'b'.repeat(200),
                verified: false,
            })

            expect(screen.getByText('a'.repeat(200))).toBeInTheDocument()
            expect(screen.queryByText('...')).not.toBeInTheDocument()
        })
    })
})
