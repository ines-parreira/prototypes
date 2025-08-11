import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StepCard } from '../StepCard'
import { StepCardActionMenu } from '../StepCardActionMenu'
import { StepCardActionMenuItem } from '../StepCardActionMenuItem'

describe('StepCard', () => {
    it('should render title and description', () => {
        render(
            <StepCard
                title="Test Step"
                description="This is a test description"
            />,
        )

        expect(screen.getByText('Test Step')).toBeInTheDocument()
        expect(
            screen.getByText('This is a test description'),
        ).toBeInTheDocument()
    })

    it('should render with icon when provided', () => {
        const TestIcon = () => <span>test-icon</span>
        render(
            <StepCard
                title="Test Step"
                description="Description"
                icon={<TestIcon />}
            />,
        )

        expect(screen.getByText('test-icon')).toBeInTheDocument()
    })

    it('should apply selected styles when isSelected is true', () => {
        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                isSelected={true}
            />,
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).toHaveClass('selected')
    })

    it('should not apply selected styles when isSelected is false', () => {
        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                isSelected={false}
            />,
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).not.toHaveClass('selected')
    })

    it('should render error icon when errors are provided', () => {
        render(
            <StepCard
                title="Test Step"
                description="Description"
                errors={['Error 1', 'Error 2']}
            />,
        )

        expect(screen.getByText('warning_amber')).toBeInTheDocument()
    })

    it('should apply error styles when errors are provided', () => {
        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                errors={['Error 1']}
            />,
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).toHaveClass('withErrors')
    })

    it('should not show error icon when no errors', () => {
        render(
            <StepCard
                title="Test Step"
                description="Description"
                errors={[]}
            />,
        )

        expect(screen.queryByText('warning_amber')).not.toBeInTheDocument()
    })

    it('should handle empty errors array', () => {
        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                errors={[]}
            />,
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).not.toHaveClass('withErrors')
        expect(screen.queryByText('warning_amber')).not.toBeInTheDocument()
    })

    it('should use TruncateCellContent for description', () => {
        const longDescription =
            'This is a very long description that should be truncated'
        render(<StepCard title="Test Step" description={longDescription} />)

        expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should render with both selected and error states', () => {
        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                isSelected={true}
                errors={['Error']}
            />,
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).toHaveClass('selected')
        expect(stepCard).toHaveClass('withErrors')
    })

    it('should render with custom icon component', () => {
        const CustomIcon = () => <i className="material-icons">custom_icon</i>

        render(
            <StepCard
                title="Test Step"
                description="Description"
                icon={<CustomIcon />}
            />,
        )

        expect(screen.getByText('custom_icon')).toBeInTheDocument()
    })

    it('should handle special characters in title and description', () => {
        render(
            <StepCard
                title="Step & <Action>"
                description="Description with 'quotes' and special chars"
            />,
        )

        expect(screen.getByText('Step & <Action>')).toBeInTheDocument()
        expect(
            screen.getByText("Description with 'quotes' and special chars"),
        ).toBeInTheDocument()
    })

    it('should render children when provided', () => {
        render(
            <StepCard title="Test Step" description="Description">
                <div>Child content</div>
            </StepCard>,
        )

        expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should render StepCardActionMenu as child', () => {
        render(
            <StepCard title="Test Step" description="Description">
                <StepCardActionMenu>
                    <StepCardActionMenuItem label="Edit" onClick={jest.fn()} />
                    <StepCardActionMenuItem
                        label="Delete"
                        onClick={jest.fn()}
                    />
                </StepCardActionMenu>
            </StepCard>,
        )

        expect(screen.getByTitle('Action menu')).toBeInTheDocument()
    })

    it('should show dropdown menu when menu button is clicked', async () => {
        render(
            <StepCard title="Test Step" description="Description">
                <StepCardActionMenu>
                    <StepCardActionMenuItem label="Edit" onClick={jest.fn()} />
                    <StepCardActionMenuItem
                        label="Delete"
                        onClick={jest.fn()}
                    />
                </StepCardActionMenu>
            </StepCard>,
        )

        const menuButton = screen.getByTitle('Action menu')

        act(() => {
            userEvent.click(menuButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument()
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    it('should call onClick handler when menu item is clicked', async () => {
        const handleEdit = jest.fn()
        const handleDelete = jest.fn()

        render(
            <StepCard title="Test Step" description="Description">
                <StepCardActionMenu>
                    <StepCardActionMenuItem label="Edit" onClick={handleEdit} />
                    <StepCardActionMenuItem
                        label="Delete"
                        onClick={handleDelete}
                    />
                </StepCardActionMenu>
            </StepCard>,
        )

        const menuButton = screen.getByTitle('Action menu')

        act(() => {
            userEvent.click(menuButton)
        })

        const editOption = await screen.findByText('Edit')

        act(() => {
            userEvent.click(editOption)
        })

        await waitFor(() => {
            expect(handleEdit).toHaveBeenCalledTimes(1)
            expect(handleDelete).not.toHaveBeenCalled()
        })
    })

    it('should render with icon, errors, and menu', () => {
        const TestIcon = () => <span>test-icon</span>

        const { container } = render(
            <StepCard
                title="Test Step"
                description="Description"
                icon={<TestIcon />}
                errors={['Error 1']}
            >
                <StepCardActionMenu>
                    <StepCardActionMenuItem
                        label="Option 1"
                        onClick={jest.fn()}
                    />
                </StepCardActionMenu>
            </StepCard>,
        )

        expect(screen.getByText('test-icon')).toBeInTheDocument()
        expect(screen.getByText('warning_amber')).toBeInTheDocument()
        expect(screen.getByTitle('Action menu')).toBeInTheDocument()

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard).toHaveClass('withErrors')
    })

    it('should render menu items with icons when icon prop is provided', () => {
        render(
            <StepCard title="Test Step" description="Description">
                <StepCardActionMenu>
                    <StepCardActionMenuItem
                        label="Edit"
                        icon="edit"
                        onClick={jest.fn()}
                    />
                    <StepCardActionMenuItem
                        label="Delete"
                        icon="delete"
                        onClick={jest.fn()}
                    />
                </StepCardActionMenu>
            </StepCard>,
        )

        expect(screen.getByTitle('Action menu')).toBeInTheDocument()
    })
})
