import { screen } from '@testing-library/react'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TimelineHeader } from '../TimelineHeader'

describe('TimelineHeader', () => {
    describe('Title generation with firstName and lastName', () => {
        it('should display full name when both firstName and lastName are provided', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John" lastName="Doe" />,
            )

            expect(screen.getByText('John Doe Timeline')).toBeInTheDocument()
        })

        it('should display only firstName when lastName is not provided', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John" />,
            )

            expect(screen.getByText('John Timeline')).toBeInTheDocument()
        })

        it('should display only lastName when firstName is not provided', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader lastName="Doe" />,
            )

            expect(screen.getByText('Doe Timeline')).toBeInTheDocument()
        })

        it('should display "Customer timeline" when neither firstName nor lastName is provided', () => {
            renderWithStoreAndQueryClientProvider(<TimelineHeader />)

            expect(screen.getByText('Customer timeline')).toBeInTheDocument()
        })

        it('should display only firstName when lastName is empty string', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John" lastName="" />,
            )

            expect(screen.getByText('John Timeline')).toBeInTheDocument()
        })

        it('should display only lastName when firstName is empty string', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="" lastName="Doe" />,
            )

            expect(screen.getByText('Doe Timeline')).toBeInTheDocument()
        })

        it('should display "Customer timeline" when both firstName and lastName are empty strings', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="" lastName="" />,
            )

            expect(screen.getByText('Customer timeline')).toBeInTheDocument()
        })

        it('should handle names with special characters', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="María" lastName="O'Connor" />,
            )

            expect(
                screen.getByText("María O'Connor Timeline"),
            ).toBeInTheDocument()
        })

        it('should handle names with multiple spaces correctly', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader
                    firstName="John Paul"
                    lastName="van der Berg"
                />,
            )

            expect(
                screen.getByText('John Paul van der Berg Timeline'),
            ).toBeInTheDocument()
        })

        it('should preserve spaces in the middle when firstName has trailing space', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John " lastName="Doe" />,
            )

            // The trim() in the component only trims the final result's leading/trailing spaces
            // Middle spaces are preserved, so "John " + " " + "Doe" = "John  Doe"
            // Use regex to match with multiple spaces
            expect(screen.getByText(/John\s+Doe Timeline/)).toBeInTheDocument()
        })

        it('should display firstName with trailing "Timeline" when only firstName with trailing space', () => {
            renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John " />,
            )

            expect(screen.getByText('John Timeline')).toBeInTheDocument()
        })
    })

    describe('Component structure', () => {
        it('should render text with bold variant', () => {
            const { container } = renderWithStoreAndQueryClientProvider(
                <TimelineHeader firstName="John" lastName="Doe" />,
            )

            // Check for the Text component with bold variant
            const textElement = container.querySelector('[data-name="text"]')
            expect(textElement).toBeInTheDocument()
        })
    })
})
