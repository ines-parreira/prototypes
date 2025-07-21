import { render, screen, waitFor } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import { Navigation } from '../Navigation'

describe('Navigation Integration', () => {
    it('handles single section selection', async () => {
        render(
            <Navigation.Root multiple={false}>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Section 1
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 1
                    </Navigation.SectionContent>
                </Navigation.Section>
                <Navigation.Section value="section2">
                    <Navigation.SectionTrigger>
                        Section 2
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 2
                    </Navigation.SectionContent>
                </Navigation.Section>
            </Navigation.Root>,
        )

        expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 1' }))
        expect(screen.queryByText('Content 1')).toBeInTheDocument()
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 2' }))
        await waitFor(() => {
            expect(screen.queryByText('Content 1')).not.toBeVisible()
        })
        expect(screen.queryByText('Content 2')).toBeInTheDocument()
    })

    it('handles multiple section selection', async () => {
        render(
            <Navigation.Root multiple>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Section 1
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 1
                    </Navigation.SectionContent>
                </Navigation.Section>
                <Navigation.Section value="section2">
                    <Navigation.SectionTrigger>
                        Section 2
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 2
                    </Navigation.SectionContent>
                </Navigation.Section>
            </Navigation.Root>,
        )

        expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 1' }))
        await waitFor(() => {
            expect(screen.queryByText('Content 1')).toBeInTheDocument()
        })
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 2' }))
        expect(screen.queryByText('Content 1')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.queryByText('Content 2')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByRole('button', { name: 'Section 1' }))
        await waitFor(() => {
            expect(screen.queryByText('Content 1')).not.toBeVisible()
        })
        expect(screen.queryByText('Content 2')).toBeInTheDocument()
    })

    it('handles disabled state', async () => {
        render(
            <Navigation.Root disabled>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Section 1
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 1
                    </Navigation.SectionContent>
                </Navigation.Section>
                <Navigation.Section value="section2" disabled>
                    <Navigation.SectionTrigger>
                        Section 2
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 2
                    </Navigation.SectionContent>
                </Navigation.Section>
            </Navigation.Root>,
        )

        expect(screen.getByText('Section 1')).toBeDisabled()
        expect(screen.getByText('Section 2')).toBeDisabled()

        await userEvent.click(screen.getByRole('button', { name: 'Section 1' }))
        expect(screen.queryByText('Content 1')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 2' }))
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('handles controlled state', async () => {
        const onValueChange = jest.fn()
        render(
            <Navigation.Root value={['section1']} onValueChange={onValueChange}>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Section 1
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 1
                    </Navigation.SectionContent>
                </Navigation.Section>
                <Navigation.Section value="section2">
                    <Navigation.SectionTrigger>
                        Section 2
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 2
                    </Navigation.SectionContent>
                </Navigation.Section>
            </Navigation.Root>,
        )

        expect(screen.queryByText('Content 1')).toBeInTheDocument()
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Section 1' }))
        expect(onValueChange).toHaveBeenCalledWith([])

        await userEvent.click(screen.getByRole('button', { name: 'Section 2' }))
        expect(onValueChange).toHaveBeenCalledWith(['section2'])
    })

    it('handles indicators and accessibility', () => {
        render(
            <Navigation.Root value={['section1']}>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Section 1
                        <Navigation.SectionIndicator />
                    </Navigation.SectionTrigger>
                    <Navigation.SectionContent>
                        Content 1
                    </Navigation.SectionContent>
                </Navigation.Section>
            </Navigation.Root>,
        )

        const trigger = screen.getByText('Section 1')
        const content = screen.getByText('Content 1')

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(trigger).toHaveAttribute('aria-controls')
        expect(content).toHaveAttribute('aria-labelledby')
        expect(content).toHaveAttribute('role', 'region')
    })
})
