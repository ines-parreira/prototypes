import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatVisibilityCard } from './ChatVisibilityCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    ToggleField: ({
        label,
        value,
        onChange,
    }: {
        label: string
        value: boolean
        onChange: (value: boolean) => void
    }) => (
        <label>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    ),
}))

describe('ChatVisibilityCard', () => {
    const defaultProps = {
        displayChat: true,
        showOutsideBusinessHours: true,
        showOnMobile: true,
        displayCampaignsWhenHidden: false,
        onDisplayChatChange: jest.fn(),
        onShowOutsideBusinessHoursChange: jest.fn(),
        onShowOnMobileChange: jest.fn(),
        onDisplayCampaignsWhenHiddenChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatVisibilityCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the section heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Where chat appears' }),
        ).toBeInTheDocument()
    })

    it('should render the section description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Control when and where your chat widget is visible to customers.',
            ),
        ).toBeInTheDocument()
    })

    it('should render all four toggle fields', () => {
        renderComponent()

        expect(screen.getByLabelText('Display chat')).toBeInTheDocument()
        expect(
            screen.getByLabelText('Show chat outside of business hours'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Show on mobile')).toBeInTheDocument()
        expect(
            screen.getByLabelText('Display campaigns when chat is hidden'),
        ).toBeInTheDocument()
    })

    describe('Display chat toggle', () => {
        it('should render checked when displayChat is true', () => {
            renderComponent({ displayChat: true })

            expect(screen.getByLabelText('Display chat')).toBeChecked()
        })

        it('should render unchecked when displayChat is false', () => {
            renderComponent({ displayChat: false })

            expect(screen.getByLabelText('Display chat')).not.toBeChecked()
        })

        it('should call onDisplayChatChange when toggled', async () => {
            const user = userEvent.setup()
            const onDisplayChatChange = jest.fn()
            renderComponent({ displayChat: true, onDisplayChatChange })

            await user.click(screen.getByLabelText('Display chat'))

            expect(onDisplayChatChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Show outside business hours toggle', () => {
        it('should render checked when showOutsideBusinessHours is true', () => {
            renderComponent({ showOutsideBusinessHours: true })

            expect(
                screen.getByLabelText('Show chat outside of business hours'),
            ).toBeChecked()
        })

        it('should render unchecked when showOutsideBusinessHours is false', () => {
            renderComponent({ showOutsideBusinessHours: false })

            expect(
                screen.getByLabelText('Show chat outside of business hours'),
            ).not.toBeChecked()
        })

        it('should call onShowOutsideBusinessHoursChange when toggled', async () => {
            const user = userEvent.setup()
            const onShowOutsideBusinessHoursChange = jest.fn()
            renderComponent({
                showOutsideBusinessHours: false,
                onShowOutsideBusinessHoursChange,
            })

            await user.click(
                screen.getByLabelText('Show chat outside of business hours'),
            )

            expect(onShowOutsideBusinessHoursChange).toHaveBeenCalledWith(true)
        })
    })

    describe('Show on mobile toggle', () => {
        it('should render checked when showOnMobile is true', () => {
            renderComponent({ showOnMobile: true })

            expect(screen.getByLabelText('Show on mobile')).toBeChecked()
        })

        it('should render unchecked when showOnMobile is false', () => {
            renderComponent({ showOnMobile: false })

            expect(screen.getByLabelText('Show on mobile')).not.toBeChecked()
        })

        it('should call onShowOnMobileChange when toggled', async () => {
            const user = userEvent.setup()
            const onShowOnMobileChange = jest.fn()
            renderComponent({ showOnMobile: true, onShowOnMobileChange })

            await user.click(screen.getByLabelText('Show on mobile'))

            expect(onShowOnMobileChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Display campaigns when hidden toggle', () => {
        it('should render unchecked when displayCampaignsWhenHidden is false', () => {
            renderComponent({ displayCampaignsWhenHidden: false })

            expect(
                screen.getByLabelText('Display campaigns when chat is hidden'),
            ).not.toBeChecked()
        })

        it('should render checked when displayCampaignsWhenHidden is true', () => {
            renderComponent({ displayCampaignsWhenHidden: true })

            expect(
                screen.getByLabelText('Display campaigns when chat is hidden'),
            ).toBeChecked()
        })

        it('should call onDisplayCampaignsWhenHiddenChange when toggled', async () => {
            const user = userEvent.setup()
            const onDisplayCampaignsWhenHiddenChange = jest.fn()
            renderComponent({
                displayCampaignsWhenHidden: false,
                onDisplayCampaignsWhenHiddenChange,
            })

            await user.click(
                screen.getByLabelText('Display campaigns when chat is hidden'),
            )

            expect(onDisplayCampaignsWhenHiddenChange).toHaveBeenCalledWith(
                true,
            )
        })
    })
})
