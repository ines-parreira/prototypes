import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ArticleRecommendationCard } from './ArticleRecommendationCard'

const renderComponent = (
    props: Partial<Parameters<typeof ArticleRecommendationCard>[0]> = {},
) => {
    const defaultProps = {
        isEnabled: false,
        onChange: jest.fn(),
    }

    return render(<ArticleRecommendationCard {...defaultProps} {...props} />)
}

describe('ArticleRecommendationCard', () => {
    it('should render the card with heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: /article recommendations/i }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                /automatically send a help center article in response to customer questions/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render toggle in unchecked state when isEnabled is false', () => {
        renderComponent({ isEnabled: false })

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()
    })

    it('should render toggle in checked state when isEnabled is true', () => {
        renderComponent({ isEnabled: true })

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeChecked()
    })

    it('should call onChange when toggle is clicked', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent({ isEnabled: false, onChange })

        const toggle = screen.getByRole('switch')
        await user.click(toggle)

        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should disable toggle when isDisabled is true', () => {
        renderComponent({ isDisabled: true })

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeDisabled()
    })

    it('should render skeleton when isLoading is true', () => {
        renderComponent({ isLoading: true })

        expect(
            screen.queryByRole('heading', { name: /article recommendations/i }),
        ).not.toBeInTheDocument()
    })

    it('should not render help center required tag by default', () => {
        renderComponent()

        expect(
            screen.queryByText(/help center required/i),
        ).not.toBeInTheDocument()
    })

    it('should render help center required tag when showHelpCenterRequired is true', () => {
        renderComponent({ showHelpCenterRequired: true })

        expect(screen.getByText(/help center required/i)).toBeInTheDocument()
    })
})
