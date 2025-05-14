import { render, screen } from '@testing-library/react'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardFooter,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from '../card/EngagementSettingsCard'

describe('EngagementSettingsCard', () => {
    it('should render with default styles', () => {
        render(<EngagementSettingsCard>Test Content</EngagementSettingsCard>)
        expect(screen.getByText('Test Content')).toHaveClass('cardContainer')
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCard ref={ref}>
                Test Content
            </EngagementSettingsCard>,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardContentWrapper', () => {
    it('should render with default styles', () => {
        render(
            <EngagementSettingsCardContentWrapper>
                Test Content
            </EngagementSettingsCardContentWrapper>,
        )
        expect(screen.getByText('Test Content')).toHaveClass(
            'cardContentWrapper',
        )
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardContentWrapper ref={ref}>
                Test Content
            </EngagementSettingsCardContentWrapper>,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardContent', () => {
    it('should render with default styles', () => {
        render(
            <EngagementSettingsCardContent>
                Test Content
            </EngagementSettingsCardContent>,
        )
        expect(screen.getByText('Test Content')).toHaveClass('cardContent')
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardContent ref={ref}>
                Test Content
            </EngagementSettingsCardContent>,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardTitle', () => {
    it('should render with default styles', () => {
        render(
            <EngagementSettingsCardTitle>
                Test Title
            </EngagementSettingsCardTitle>,
        )
        expect(screen.getByText('Test Title')).toHaveClass('cardTitle')
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardTitle ref={ref}>
                Test Title
            </EngagementSettingsCardTitle>,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardDescription', () => {
    it('should render with default styles', () => {
        render(
            <EngagementSettingsCardDescription>
                Test Description
            </EngagementSettingsCardDescription>,
        )
        expect(screen.getByText('Test Description')).toHaveClass(
            'cardDescription',
        )
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardDescription ref={ref}>
                Test Description
            </EngagementSettingsCardDescription>,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardImage', () => {
    it('should render with default styles', () => {
        render(<EngagementSettingsCardImage alt="Test Image" src="test.jpg" />)
        expect(screen.getByRole('img')).toHaveClass('cardImage')
    })

    it('should render with alt and src', () => {
        render(<EngagementSettingsCardImage alt="Test Image" src="test.jpg" />)
        expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg')
        expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Image')
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardImage
                ref={ref}
                alt="Test Image"
                src="test.jpg"
            />,
        )
        expect(ref).toHaveBeenCalled()
    })
})

describe('EngagementSettingsCardFooter', () => {
    it('should render with default styles', () => {
        render(
            <EngagementSettingsCardFooter>
                Test Footer
            </EngagementSettingsCardFooter>,
        )
        expect(screen.getByText('Test Footer')).toHaveClass('cardFooter')
    })

    it('should forward ref', () => {
        const ref = jest.fn()
        render(
            <EngagementSettingsCardFooter ref={ref}>
                Test Footer
            </EngagementSettingsCardFooter>,
        )
        expect(ref).toHaveBeenCalled()
    })
})
