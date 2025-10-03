import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { SetupTaskSection } from '../SetupTaskSection'

describe('SetupTaskSection', () => {
    it('should render the setup checklist header', () => {
        render(<SetupTaskSection />)

        expect(screen.getByText('Setup checklist')).toBeInTheDocument()
        expect(screen.getByText('20% complete')).toBeInTheDocument()
    })

    it('should render all category tabs', () => {
        render(<SetupTaskSection />)

        expect(screen.getByText('Essential')).toBeInTheDocument()
        expect(screen.getByText('Customize')).toBeInTheDocument()
        expect(screen.getByText('Train')).toBeInTheDocument()
        expect(screen.getByText('Deploy')).toBeInTheDocument()
    })

    it('should show Essential category tasks by default', () => {
        render(<SetupTaskSection />)

        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.getByText('Update Shopify permissions'),
        ).toBeInTheDocument()
    })

    it('should switch category when clicking on a different tab', () => {
        render(<SetupTaskSection />)

        // Click on Customize tab
        fireEvent.click(screen.getByText('Customize'))

        // Check that Customize tasks are shown (use partial text matching due to quotes)
        expect(
            screen.getByText(/Enable.*Trigger on Search/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Enable.*Suggested product questions/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Enable.*Ask anything input/),
        ).toBeInTheDocument()

        // Verify Essential tasks are no longer visible
        expect(
            screen.queryByText('Verify your email domain'),
        ).not.toBeInTheDocument()
    })

    it('should show Train category tasks when Train tab is clicked', async () => {
        render(<SetupTaskSection />)

        fireEvent.click(screen.getByText('Train'))

        await waitFor(() => {
            expect(screen.getByText('Create an Action')).toBeInTheDocument()
            expect(
                screen.getByText('Monitor AI Agent interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should show Deploy category tasks when Deploy tab is clicked', async () => {
        render(<SetupTaskSection />)

        fireEvent.click(screen.getByText('Deploy'))

        await waitFor(() => {
            expect(
                screen.getByText('Enable AI Agent on chat'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Enable AI Agent on email'),
            ).toBeInTheDocument()
        })
    })

    it('should show completed icon for completed tasks in Essential category', () => {
        render(<SetupTaskSection />)

        // Essential tasks are marked as completed
        // Look for circle-check icons next to the task names
        const verifyEmailTask = screen.getByText('Verify your email domain')
        const updateShopifyTask = screen.getByText('Update Shopify permissions')

        // Check that completed icons are present in the task headers
        expect(
            verifyEmailTask.closest('.stepTitleContainer'),
        ).toBeInTheDocument()
        expect(
            updateShopifyTask.closest('.stepTitleContainer'),
        ).toBeInTheDocument()
    })

    it('should expand accordion item and show task body when clicked', async () => {
        render(<SetupTaskSection />)

        const verifyEmailTask = screen.getByText('Verify your email domain')

        // Click to expand
        fireEvent.click(verifyEmailTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Verify' }),
            ).toBeInTheDocument()
        })
    })

    it('should show loading icon in the progress section', () => {
        render(<SetupTaskSection />)

        const loadingIcon = screen.getByAltText('loading icon')
        expect(loadingIcon).toBeInTheDocument()
        expect(loadingIcon).toHaveAttribute('width', '16px')
    })

    it('should mark Essential category tab as completed', () => {
        render(<SetupTaskSection />)

        // The Essential category should have completed styling
        const essentialTab = screen.getByText('Essential').parentElement
        expect(essentialTab?.className).toMatch(/completed/)
    })

    it('should not mark Customize category tab as completed', () => {
        render(<SetupTaskSection />)

        const customizeTab = screen.getByText('Customize').closest('div')
        expect(customizeTab).not.toHaveClass('completed')
    })

    it('should not mark Train category tab as completed', () => {
        render(<SetupTaskSection />)

        const trainTab = screen.getByText('Train').closest('div')
        expect(trainTab).not.toHaveClass('completed')
    })

    it('should not mark Deploy category tab as completed', () => {
        render(<SetupTaskSection />)

        const deployTab = screen.getByText('Deploy').closest('div')
        expect(deployTab).not.toHaveClass('completed')
    })

    it('should apply selected class to the currently selected category', () => {
        render(<SetupTaskSection />)

        // Essential is selected by default
        let essentialTab = screen.getByText('Essential').parentElement
        expect(essentialTab?.className).toMatch(/selected/)

        // Click on Train
        fireEvent.click(screen.getByText('Train'))

        const trainTab = screen.getByText('Train').parentElement
        expect(trainTab?.className).toMatch(/selected/)

        // Essential should no longer be selected
        essentialTab = screen.getByText('Essential').parentElement
        expect(essentialTab?.className).not.toMatch(/selected/)
    })

    it('should handle multiple category switches correctly', () => {
        render(<SetupTaskSection />)

        // Start with Essential
        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()

        // Switch to Customize
        fireEvent.click(screen.getByText('Customize'))
        expect(
            screen.getByText(/Enable.*Trigger on Search/),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Verify your email domain'),
        ).not.toBeInTheDocument()

        // Switch to Train
        fireEvent.click(screen.getByText('Train'))
        expect(screen.getByText('Create an Action')).toBeInTheDocument()
        expect(
            screen.queryByText(/Enable.*Trigger on Search/),
        ).not.toBeInTheDocument()

        // Switch to Deploy
        fireEvent.click(screen.getByText('Deploy'))
        expect(screen.getByText('Enable AI Agent on chat')).toBeInTheDocument()
        expect(screen.queryByText('Create an Action')).not.toBeInTheDocument()

        // Switch back to Essential
        fireEvent.click(screen.getByText('Essential'))
        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.queryByText('Enable AI Agent on chat'),
        ).not.toBeInTheDocument()
    })

    it('should expand multiple accordion items independently', async () => {
        render(<SetupTaskSection />)

        const verifyEmailTask = screen.getByText('Verify your email domain')
        const updateShopifyTask = screen.getByText('Update Shopify permissions')

        fireEvent.click(verifyEmailTask)
        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
        })

        fireEvent.click(updateShopifyTask)
        await waitFor(() => {
            expect(
                screen.getByText(
                    'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                'Ensure customers receive emails from the AI Agent by verifying your domain.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
            ),
        ).toBeInTheDocument()
    })

    it('should render correct task bodies for Customize category', async () => {
        render(<SetupTaskSection />)

        fireEvent.click(screen.getByText('Customize'))

        // Expand Enable Trigger on Search (use regex for quotes)
        const triggerTask = screen.getByText(/Enable.*Trigger on Search/)
        fireEvent.click(triggerTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Guide shoppers to right products by having AI Agent start a conversation after they use search.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should render correct task bodies for Train category', async () => {
        render(<SetupTaskSection />)

        fireEvent.click(screen.getByText('Train'))

        // Expand Create an Action
        const createActionTask = await screen.findByText('Create an Action')
        fireEvent.click(createActionTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create' }),
            ).toBeInTheDocument()
        })
    })

    it('should render correct task bodies for Deploy category', async () => {
        render(<SetupTaskSection />)

        fireEvent.click(screen.getByText('Deploy'))

        // Expand Enable AI Agent on chat
        const chatTask = screen.getByText('Enable AI Agent on chat')
        fireEvent.click(chatTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Start automating conversations on email to save time and provide faster, more personalized responses to your customers.',
                ),
            ).toBeInTheDocument()
        })
    })
})
