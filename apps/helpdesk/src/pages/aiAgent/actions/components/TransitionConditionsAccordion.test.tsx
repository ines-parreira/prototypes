import { fireEvent, render, screen } from '@testing-library/react'

import { TransitionsState } from '../types'
import TransitionConditionsAccordion from './TransitionConditionsAccordion'

const mockTransition: TransitionsState = {
    name: 'Test Condition',
    conditions: {
        and: [],
    },
    from_step_id: 'test-step-456',
    to_step_id: 'test-step-789',
    result: true,
}

const renderComponent = (transition: TransitionsState) => {
    return render(<TransitionConditionsAccordion transition={transition} />)
}

describe('TransitionConditionsAccordion', () => {
    it('should render with transition name', () => {
        renderComponent(mockTransition)

        expect(
            screen.getByText(/Branch taken:.*Test Condition/),
        ).toBeInTheDocument()
        expect(screen.getByText('call_split')).toBeInTheDocument()
    })

    it('should render with default name when transition name is not provided', () => {
        const transitionWithoutName = {
            ...mockTransition,
            name: undefined,
        }
        renderComponent(transitionWithoutName)

        expect(
            screen.getByText(/Branch taken:.*Unnamed Branch/),
        ).toBeInTheDocument()
    })

    it('should expand and show transition details when clicked', async () => {
        const { container } = renderComponent(mockTransition)

        const header = container.querySelector('.container')
        fireEvent.click(header!)

        const codeBlock = await screen.findByText((content, element) => {
            return (
                element?.tagName === 'PRE' &&
                content.includes('"name": "Test Condition"')
            )
        })

        expect(codeBlock).toBeInTheDocument()
        expect(codeBlock).toHaveTextContent('"name": "Test Condition"')
        expect(codeBlock).toHaveTextContent('"from_step_id": "test-step-456"')
        expect(codeBlock).toHaveTextContent('"to_step_id": "test-step-789"')
    })

    it('should render transition with correct structure', () => {
        renderComponent(mockTransition)

        expect(
            screen.getByText(/Branch taken:.*Test Condition/),
        ).toBeInTheDocument()
        expect(screen.getByText('call_split')).toBeInTheDocument()
    })

    it('should render complete transition object as JSON', async () => {
        const { container } = renderComponent(mockTransition)

        const header = container.querySelector('.container')
        fireEvent.click(header!)

        const codeBlock = await screen.findByText((content, element) => {
            return (
                element?.tagName === 'PRE' &&
                content.includes('"name": "Test Condition"')
            )
        })

        const parsedContent = JSON.parse(codeBlock.textContent || '{}')
        expect(parsedContent).toEqual({
            name: 'Test Condition',
            conditions: { and: [] },
            from_step_id: 'test-step-456',
            to_step_id: 'test-step-789',
            result: true,
        })
    })

    it('should render accordion with correct content', () => {
        renderComponent(mockTransition)

        // Check that the accordion component is rendered with correct content
        expect(
            screen.getByText('Route customers using variables'),
        ).toBeInTheDocument()
        expect(screen.getByText('call_split')).toBeInTheDocument()
    })

    it('should render with complex conditions', async () => {
        const complexTransition: TransitionsState = {
            ...mockTransition,
            conditions: {
                and: [],
            },
            result: false,
        }

        const { container } = renderComponent(complexTransition)

        const header = container.querySelector('.container')
        fireEvent.click(header!)

        const codeBlock = await screen.findByText((content, element) => {
            return (
                element?.tagName === 'PRE' && content.includes('"conditions"')
            )
        })

        expect(codeBlock).toHaveTextContent('"and"')
    })

    it('should display "Details" label', () => {
        renderComponent(mockTransition)

        expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should render transition with empty name as "Unnamed Branch"', () => {
        const emptyNameTransition = {
            ...mockTransition,
            name: null,
        }
        renderComponent(emptyNameTransition)

        expect(
            screen.getByText(/Branch taken:.*Unnamed Branch/),
        ).toBeInTheDocument()
    })

    it('should render header with icon and title', () => {
        renderComponent(mockTransition)

        expect(screen.getByText('call_split')).toBeInTheDocument()
        expect(
            screen.getByText('Route customers using variables'),
        ).toBeInTheDocument()
    })

    it('should maintain accordion expand/collapse state', async () => {
        const { container } = renderComponent(mockTransition)

        const header = container.querySelector('.container')

        // Click to expand
        fireEvent.click(header!)

        // Should show the pre element when expanded
        const codeBlock = await screen.findByText(
            (content, element) => element?.tagName === 'PRE',
        )
        expect(codeBlock).toBeInTheDocument()

        // Verify the content is visible
        expect(codeBlock).toHaveTextContent('"name": "Test Condition"')
    })
})
