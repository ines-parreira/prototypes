import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    QUICK_REPLIES_MAX_ITEM_LENGTH,
    QUICK_REPLIES_MAX_ITEMS,
} from 'config/integrations/gorgias_chat'

import { QuickRepliesCard } from './QuickRepliesCard'

describe('QuickRepliesCard', () => {
    const defaultProps = {
        isEnabled: false,
        replies: [],
        onChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<QuickRepliesCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Quick replies' }),
        ).toBeInTheDocument()
    })

    it('should render the description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'When a customer opens the chat, select the quick replies the customer can click on.',
            ),
        ).toBeInTheDocument()
    })

    describe('toggle', () => {
        it('should render checked when isEnabled is true', () => {
            renderComponent({ isEnabled: true })

            expect(screen.getByRole('switch')).toBeChecked()
        })

        it('should render unchecked when isEnabled is false', () => {
            renderComponent({ isEnabled: false })

            expect(screen.getByRole('switch')).not.toBeChecked()
        })

        it('should call onChange with enabled true when toggled on', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({ isEnabled: false, replies: ['hello'], onChange })

            await user.click(screen.getByRole('switch'))

            expect(onChange).toHaveBeenCalledWith({
                enabled: true,
                replies: ['hello'],
            })
        })

        it('should call onChange with enabled false when toggled off', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({ isEnabled: true, replies: ['hello'], onChange })

            await user.click(screen.getByRole('switch'))

            expect(onChange).toHaveBeenCalledWith({
                enabled: false,
                replies: ['hello'],
            })
        })
    })

    describe('when isEnabled is false', () => {
        it('should not render the replies section', () => {
            renderComponent({ isEnabled: false })

            expect(
                screen.queryByRole('button', { name: /Add quick reply/ }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when isEnabled is true', () => {
        it('should render the Add quick reply button', () => {
            renderComponent({ isEnabled: true })

            expect(
                screen.getByRole('button', { name: /Add quick reply/ }),
            ).toBeInTheDocument()
        })

        it('should render existing reply inputs', () => {
            renderComponent({
                isEnabled: true,
                replies: ['Hello', 'How can I help?'],
            })

            expect(screen.getByLabelText('Quick reply 1')).toBeInTheDocument()
            expect(screen.getByLabelText('Quick reply 2')).toBeInTheDocument()
        })

        it('should render reply inputs with correct values', () => {
            renderComponent({
                isEnabled: true,
                replies: ['Hello', 'How can I help?'],
            })

            expect(screen.getByLabelText('Quick reply 1')).toHaveValue('Hello')
            expect(screen.getByLabelText('Quick reply 2')).toHaveValue(
                'How can I help?',
            )
        })

        it('should render reply inputs with correct maxLength', () => {
            renderComponent({ isEnabled: true, replies: ['Hello'] })

            expect(screen.getByLabelText('Quick reply 1')).toHaveAttribute(
                'maxlength',
                String(QUICK_REPLIES_MAX_ITEM_LENGTH),
            )
        })

        it('should render a remove button for each reply', () => {
            renderComponent({
                isEnabled: true,
                replies: ['Hello', 'How can I help?'],
            })

            expect(
                screen.getByLabelText('Remove quick reply 1'),
            ).toBeInTheDocument()
            expect(
                screen.getByLabelText('Remove quick reply 2'),
            ).toBeInTheDocument()
        })

        it('should call onChange when a reply text is changed', () => {
            const onChange = jest.fn()
            renderComponent({
                isEnabled: true,
                replies: [''],
                onChange,
            })

            fireEvent.change(screen.getByLabelText('Quick reply 1'), {
                target: { value: 'Hi' },
            })

            expect(onChange).toHaveBeenCalledWith({
                enabled: true,
                replies: ['Hi'],
            })
        })

        it('should call onChange with new empty reply when Add quick reply is clicked', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({
                isEnabled: true,
                replies: ['Hello'],
                onChange,
            })

            await user.click(
                screen.getByRole('button', { name: /Add quick reply/ }),
            )

            expect(onChange).toHaveBeenCalledWith({
                enabled: true,
                replies: ['Hello', ''],
            })
        })

        it('should call onChange with reply removed when remove button is clicked', async () => {
            const user = userEvent.setup()
            const onChange = jest.fn()
            renderComponent({
                isEnabled: true,
                replies: ['Hello', 'How can I help?'],
                onChange,
            })

            await user.click(screen.getByLabelText('Remove quick reply 1'))

            expect(onChange).toHaveBeenCalledWith({
                enabled: true,
                replies: ['How can I help?'],
            })
        })

        describe('Add quick reply button disabled state', () => {
            it('should be enabled when replies count is below the maximum', () => {
                renderComponent({
                    isEnabled: true,
                    replies: Array(QUICK_REPLIES_MAX_ITEMS - 1).fill('reply'),
                })

                expect(
                    screen.getByRole('button', { name: /Add quick reply/ }),
                ).not.toBeDisabled()
            })

            it('should be disabled when replies count reaches the maximum', () => {
                renderComponent({
                    isEnabled: true,
                    replies: Array(QUICK_REPLIES_MAX_ITEMS).fill('reply'),
                })

                expect(
                    screen.getByRole('button', { name: /Add quick reply/ }),
                ).toBeDisabled()
            })
        })
    })
})
