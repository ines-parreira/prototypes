import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { SidebarContext } from '@repo/navigation'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { AccordionState } from 'components/Accordion/utils/accordion-state'

import { Navigation } from '../Navigation'

jest.mock('components/Accordion/hooks/useAccordion', () => ({
    useAccordion: jest.fn(),
}))

jest.mock('components/Accordion/hooks/useAccordionItem', () => ({
    useAccordionItem: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

const mockUseAccordion =
    require('components/Accordion/hooks/useAccordion').useAccordion
const mockUseAccordionItem =
    require('components/Accordion/hooks/useAccordionItem').useAccordionItem
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

const wrapper = ({
    children,
    isCollapsed = false,
}: {
    children: React.ReactNode
    isCollapsed?: boolean
}) => (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse: jest.fn() }}>
        {children}
    </SidebarContext.Provider>
)

describe('AccordionItemTrigger', () => {
    const defaultAccordionProps = {
        handleValueChange: jest.fn(),
        disabled: false,
        id: 'test-accordion',
        values: ['section1'],
    }

    const defaultItemProps = {
        isOpen: false,
        value: 'section1',
        disabled: false,
    }

    beforeEach(() => {
        mockUseAccordion.mockReturnValue(defaultAccordionProps)
        mockUseAccordionItem.mockReturnValue(defaultItemProps)
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveTextContent('Trigger')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Closed)
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('handles click events', async () => {
        const handleValueChange = jest.fn()
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            handleValueChange,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        await userEvent.click(trigger)

        expect(handleValueChange).toHaveBeenCalledWith('section1')
    })

    it('applies disabled state from root', () => {
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            disabled: true,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeDisabled()
    })

    it('applies disabled state from item', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            disabled: true,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeDisabled()
    })

    it('applies open state', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            isOpen: true,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Open)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('applies custom className', () => {
        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger className="custom-class">
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
            { wrapper },
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveClass('custom-class')
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('renders icon when provided', () => {
            render(
                <Navigation.Root>
                    <Navigation.Section value="section1">
                        <Navigation.SectionTrigger icon="settings">
                            Trigger with Icon
                        </Navigation.SectionTrigger>
                    </Navigation.Section>
                </Navigation.Root>,
                { wrapper },
            )

            const trigger = screen.getByRole('button')
            expect(trigger).toHaveTextContent('Trigger with Icon')
        })

        it('renders without icon when not provided', () => {
            render(
                <Navigation.Root>
                    <Navigation.Section value="section1">
                        <Navigation.SectionTrigger>
                            Trigger without Icon
                        </Navigation.SectionTrigger>
                    </Navigation.Section>
                </Navigation.Root>,
                { wrapper },
            )

            const trigger = screen.getByRole('button')
            expect(trigger).toHaveTextContent('Trigger without Icon')
        })
    })
})
