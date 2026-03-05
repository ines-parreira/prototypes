import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    DisplayType,
    NavigationSectionItem,
} from '../components/NavigationSectionItem'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('NavigationSectionItem', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('without wayfinding flag', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('renders as a div by default', () => {
            render(<NavigationSectionItem>Test Content</NavigationSectionItem>)
            const element = screen.getByText('Test Content')
            expect(element.tagName).toBe('DIV')
        })

        it('renders as a custom element when specified', () => {
            render(
                <NavigationSectionItem as="button">
                    Test Button
                </NavigationSectionItem>,
            )
            const element = screen.getByText('Test Button')
            expect(element.tagName).toBe('BUTTON')
        })

        it('applies selected state when isSelected is true', () => {
            render(
                <NavigationSectionItem isSelected>
                    Selected Item
                </NavigationSectionItem>,
            )
            const element = screen.getByText('Selected Item')
            expect(element).toHaveAttribute('data-selected', 'true')
        })

        it('applies default display type when not specified', () => {
            render(<NavigationSectionItem>Default Item</NavigationSectionItem>)
            const element = screen.getByText('Default Item')
            expect(element).toHaveAttribute(
                'data-display-type',
                DisplayType.Default,
            )
        })

        it('applies indent display type when specified', () => {
            render(
                <NavigationSectionItem displayType={DisplayType.Indent}>
                    Indented Item
                </NavigationSectionItem>,
            )
            const element = screen.getByText('Indented Item')
            expect(element).toHaveAttribute(
                'data-display-type',
                DisplayType.Indent,
            )
        })

        it('passes through additional props to the rendered element', () => {
            render(
                <NavigationSectionItem aria-label="Test Label">
                    Test Item
                </NavigationSectionItem>,
            )
            const element = screen.getByText('Test Item')
            expect(element).toHaveAttribute('aria-label', 'Test Label')
        })

        it('merges custom className with default classes', () => {
            render(
                <NavigationSectionItem className="custom-class">
                    Custom Class Item
                </NavigationSectionItem>,
            )
            const element = screen.getByText('Custom Class Item')
            expect(element).toHaveClass('custom-class')
        })
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('renders icon and children when icon is provided', () => {
            render(
                <NavigationSectionItem icon="settings">
                    Item Text
                </NavigationSectionItem>,
            )

            expect(screen.getByText('Item Text')).toBeInTheDocument()
        })

        it('renders only children when no icon is provided', () => {
            render(<NavigationSectionItem>Item Text</NavigationSectionItem>)

            expect(screen.getByText('Item Text')).toBeInTheDocument()
        })
    })
})
