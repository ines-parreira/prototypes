import { ComponentProps } from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import _noop from 'lodash/noop'

import { useFlag } from 'core/flags'

import { IntentsFeedbackDropdown } from '../IntentsFeedbackDropdown'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = jest.mocked(useFlag)

const minProps: ComponentProps<typeof IntentsFeedbackDropdown> = {
    label: 'no intent detected',
    messageId: 1,
    availableIntentsNames: [],
    activeIntentsNames: [],
    onToggle: _noop,
    renderAvailableIntent: (intent: string) => {
        return <div key={intent}>{intent}</div>
    },
    renderActiveIntent: (intent: string) => {
        return <div key={intent}>{intent}</div>
    },
}

describe('<IntentsFeedbackDropdown/>', () => {
    beforeEach(() => {
        minProps.activeIntentsNames = []
        mockUseFlag.mockReturnValue(false)
    })

    it('should display the toggle button with label when no intents are active', () => {
        const { container } = render(<IntentsFeedbackDropdown {...minProps} />)

        const toggleButton = container.querySelector('.toggleMenu')
        expect(toggleButton).toHaveTextContent(minProps.label)
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
    })

    it('should display available intents in dropdown when opened', async () => {
        const user = userEvent.setup()
        const mockRenderAvailableIntent = jest.fn((intent: string) => (
            <div key={intent} data-testid={`available-${intent}`}>
                {intent}
            </div>
        ))

        render(
            <IntentsFeedbackDropdown
                {...minProps}
                availableIntentsNames={['intent1', 'intent2']}
                renderAvailableIntent={mockRenderAvailableIntent}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button'))
        })

        expect(screen.getByText('Message intents')).toBeInTheDocument()
        expect(screen.getByText('Other intents')).toBeInTheDocument()
        expect(mockRenderAvailableIntent).toHaveBeenCalledWith('intent1', 0, [
            'intent1',
            'intent2',
        ])
        expect(mockRenderAvailableIntent).toHaveBeenCalledWith('intent2', 1, [
            'intent1',
            'intent2',
        ])
    })

    it('should display active intents when provided', async () => {
        const user = userEvent.setup()
        const mockRenderActiveIntent = jest.fn((intent: string) => (
            <div key={intent} data-testid={`active-${intent}`}>
                {intent}
            </div>
        ))

        render(
            <IntentsFeedbackDropdown
                {...minProps}
                activeIntentsNames={['active-intent']}
                renderActiveIntent={mockRenderActiveIntent}
            />,
        )
        await act(async () => {
            await user.click(screen.getByRole('button'))
        })

        expect(mockRenderActiveIntent).toHaveBeenCalledWith(
            'active-intent',
            0,
            ['active-intent'],
        )
    })

    it('should hide the dropdown on mouse leave', async () => {
        const user = userEvent.setup()
        const { getByRole, findByRole } = render(
            <IntentsFeedbackDropdown
                {...minProps}
                activeIntentsNames={['foo/baz']}
            />,
        )
        await act(async () => {
            await user.click(getByRole('button'))
            fireEvent.mouseLeave(getByRole('button'))
        })

        expect(await findByRole('menu', { hidden: true })).not.toBe(null)
    })

    describe('MessagesTranslations feature flag', () => {
        it('shows label and arrow when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            // Check for label in toggle button specifically
            const toggleButton = container.querySelector('.toggleMenu')
            expect(toggleButton).toHaveTextContent(minProps.label)
            expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        })

        it('shows topic icon when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            expect(screen.getByText('topic')).toBeInTheDocument()

            // Check that label is not in toggle button specifically
            const toggleButton = container.querySelector('.toggleMenu')
            expect(toggleButton).not.toHaveTextContent(minProps.label)
            expect(
                screen.queryByText('arrow_drop_down'),
            ).not.toBeInTheDocument()
        })

        it('applies hasMessageTranslation CSS class when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            const wrapper = container.querySelector('.wrapper')
            expect(wrapper).toHaveClass('hasMessageTranslation')
        })

        it('does not apply hasMessageTranslation CSS class when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            const wrapper = container.querySelector('.wrapper')
            expect(wrapper).not.toHaveClass('hasMessageTranslation')
        })

        it('applies hasMessageTranslation CSS class to toggle menu when feature flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            const toggleMenu = container.querySelector('.toggleMenu')
            expect(toggleMenu).toHaveClass('hasMessageTranslation')
        })

        it('applies hasMessageTranslation CSS class to header when dropdown is opened and feature flag is enabled', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            const header = container.querySelector('.header')
            expect(header).toHaveClass('hasMessageTranslation')
        })

        it('applies hasMessageTranslation CSS class to menu elements when dropdown is opened and feature flag is enabled', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            const { container } = render(
                <IntentsFeedbackDropdown {...minProps} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            const menuWrapper = container.querySelector('.menuWrapper')
            const menu = container.querySelector('.menu')

            expect(menuWrapper).toHaveClass('hasMessageTranslation')
            expect(menu).toHaveClass('hasMessageTranslation')
        })

        it('renders Message intents header in dropdown when opened', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            render(<IntentsFeedbackDropdown {...minProps} />)

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            expect(screen.getByText('Message intents')).toBeInTheDocument()
        })

        it('renders info icon with tooltip in dropdown header when opened', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            render(<IntentsFeedbackDropdown {...minProps} />)

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            expect(screen.getByText('info_outline')).toBeInTheDocument()
        })

        it('should display tooltip with correct content when feature flag is enabled', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            render(<IntentsFeedbackDropdown {...minProps} />)

            const toggleButton = screen.getByRole('button')
            await act(async () => {
                await user.hover(toggleButton)
            })

            const tooltip = screen.getByText(
                'Message intent: no intent detected',
            )
            expect(tooltip).toBeInTheDocument()
        })
        it('should not display tooltip when feature flag is disabled', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(false)
            render(<IntentsFeedbackDropdown {...minProps} />)

            const toggleButton = screen.getByRole('button')
            await act(async () => {
                await user.hover(toggleButton)
            })

            const tooltip = screen.queryByText(
                'Message intent: no intent detected',
            )
            expect(tooltip).not.toBeInTheDocument()
        })
    })
})
