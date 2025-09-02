import { render, screen } from '@testing-library/react'

import {
    StaticVerticalStep,
    StaticVerticalStepper,
} from '../StaticVerticalStepper'

describe('StaticVerticalStepper', () => {
    it('should render nothing when no children provided', () => {
        const { container } = render(
            <StaticVerticalStepper>{null}</StaticVerticalStepper>,
        )

        expect(container.firstChild?.childNodes.length).toBe(0)
    })

    it('should render single step correctly', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="Step 1 Description">
                    Step 1 Content
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('Step 1 Description')).toBeInTheDocument()
        expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
    })

    it('should render multiple steps correctly', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="First Step">
                    First step content
                </StaticVerticalStep>
                <StaticVerticalStep stepDescription="Second Step">
                    Second step content
                </StaticVerticalStep>
                <StaticVerticalStep stepDescription="Third Step">
                    Third step content
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('First Step')).toBeInTheDocument()
        expect(screen.getByText('First step content')).toBeInTheDocument()
        expect(screen.getByText('Second Step')).toBeInTheDocument()
        expect(screen.getByText('Second step content')).toBeInTheDocument()
        expect(screen.getByText('Third Step')).toBeInTheDocument()
        expect(screen.getByText('Third step content')).toBeInTheDocument()
    })

    it('should render React nodes as step description', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep
                    stepDescription={
                        <span>
                            Step with <strong>bold text</strong>
                        </span>
                    }
                >
                    Content
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('bold text')).toBeInTheDocument()
        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render React nodes as step content', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="Description">
                    <div>
                        <button>Click me</button>
                        <p>Paragraph content</p>
                    </div>
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('Description')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Click me' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Paragraph content')).toBeInTheDocument()
    })

    it('should render complex nested content', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep
                    stepDescription={
                        <div>
                            <span>Step 1</span>
                            <small> - with subtitle</small>
                        </div>
                    }
                >
                    <form>
                        <input type="text" placeholder="Enter text" />
                        <button type="submit">Submit</button>
                    </form>
                </StaticVerticalStep>
                <StaticVerticalStep stepDescription="Step 2">
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                    </ul>
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('Step 1')).toBeInTheDocument()
        expect(screen.getByText('- with subtitle')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Submit' }),
        ).toBeInTheDocument()

        expect(screen.getByText('Step 2')).toBeInTheDocument()
        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render the correct number of step indicators', () => {
        const { container } = render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="Step 1">
                    Content 1
                </StaticVerticalStep>
                <StaticVerticalStep stepDescription="Step 2">
                    Content 2
                </StaticVerticalStep>
                <StaticVerticalStep stepDescription="Step 3">
                    Content 3
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        const stepWrappers = container.querySelectorAll('.stepWrapper')
        expect(stepWrappers).toHaveLength(3)

        const stepIndicators = container.querySelectorAll('.stepIndicator')
        expect(stepIndicators).toHaveLength(3)
    })

    it('should handle string content correctly', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="Simple string description">
                    Simple string content
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(
            screen.getByText('Simple string description'),
        ).toBeInTheDocument()
        expect(screen.getByText('Simple string content')).toBeInTheDocument()
    })

    it('should handle mixed content types', () => {
        render(
            <StaticVerticalStepper>
                <StaticVerticalStep stepDescription="String description">
                    <div>React element content</div>
                </StaticVerticalStep>
                <StaticVerticalStep
                    stepDescription={<span>React element description</span>}
                >
                    String content
                </StaticVerticalStep>
            </StaticVerticalStepper>,
        )

        expect(screen.getByText('String description')).toBeInTheDocument()
        expect(screen.getByText('React element content')).toBeInTheDocument()
        expect(
            screen.getByText('React element description'),
        ).toBeInTheDocument()
        expect(screen.getByText('String content')).toBeInTheDocument()
    })
})
