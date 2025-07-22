import { render, screen } from '@testing-library/react'

import {
    NO_DATA_AVAILABLE_COMPONENT_TEXT,
    NO_DATA_AVAILABLE_COMPONENT_TITLE,
    NoDataAvailable,
} from 'domains/reporting/pages/common/components/NoDataAvailable'

describe('<NoDataAvailable>', () => {
    it('should render with default values', () => {
        render(<NoDataAvailable />)

        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).toBeInTheDocument()
        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TEXT),
        ).toBeInTheDocument()
    })

    it('should render with custom title and description', () => {
        const customTitle = 'Custom Title'
        const customDescription = 'Custom Description'

        render(
            <NoDataAvailable
                title={customTitle}
                description={customDescription}
            />,
        )

        expect(screen.getByText(customTitle)).toBeInTheDocument()
        expect(screen.getByText(customDescription)).toBeInTheDocument()
    })

    it('should render with ReactNode description', () => {
        const customDescription = (
            <span data-testid="custom-description">
                Custom ReactNode Description
            </span>
        )

        render(<NoDataAvailable description={customDescription} />)

        expect(screen.getByTestId('custom-description')).toBeInTheDocument()
        expect(
            screen.getByText('Custom ReactNode Description'),
        ).toBeInTheDocument()
    })

    it('should apply custom className and style', () => {
        const customClassName = 'custom-class'
        const customStyle = { backgroundColor: 'red' }

        const { container } = render(
            <NoDataAvailable
                title="Test Title"
                className={customClassName}
                style={customStyle}
            />,
        )

        const noDataElement = container.querySelector('.custom-class')
        expect(noDataElement).toBeInTheDocument()
        expect(noDataElement).toHaveStyle({ backgroundColor: 'red' })
    })

    it('should render with only title prop', () => {
        const customTitle = 'Only Title'

        render(<NoDataAvailable title={customTitle} />)

        expect(screen.getByText(customTitle)).toBeInTheDocument()
        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TEXT),
        ).toBeInTheDocument()
    })

    it('should render with only description prop', () => {
        const customDescription = 'Only Description'

        render(<NoDataAvailable description={customDescription} />)

        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TITLE),
        ).toBeInTheDocument()
        expect(screen.getByText(customDescription)).toBeInTheDocument()
    })
})
