import { LegacyButton as Button } from '@gorgias/axiom'

import css from './BookDemoContainer.less'

interface BookDemoContainerProps {
    onBookDemo: () => void
    className?: string
}

/**
 * BookDemoContainer - A reusable component for displaying "Book a demo" functionality
 *
 * This component is specifically designed for use on paywall screens throughout the AI Agent
 * feature. It provides a consistent UI for users to book a demo when they encounter
 * paywall restrictions or trial limitations.
 *
 * @param onBookDemo - Callback function invoked when the "Book a demo" button is clicked
 * @param className - Optional additional CSS class for styling customization
 *
 * @example
 * ```tsx
 * <BookDemoContainer
 *   onBookDemo={() => {
 *     logInTrialEventFromPaywall(TrialEventType.Demo, TrialType.AiAgent)
 *     openDemoPage()
 *   }}
 * />
 * ```
 */
const BookDemoContainer = ({
    onBookDemo,
    className,
}: BookDemoContainerProps) => {
    return (
        <div className={`${css.bookDemoContainer} ${className || ''}`}>
            <span className={css.secondaryText}>Let’s Talk?</span>
            <Button
                fillStyle="ghost"
                intent="secondary"
                size="medium"
                onClick={onBookDemo}
                className={css.bookDemoContainerButton}
            >
                <span className={css.bookDemoButtonText}>Book a demo</span>
            </Button>
        </div>
    )
}

export default BookDemoContainer
