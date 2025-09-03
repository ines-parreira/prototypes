import { render, screen } from '@testing-library/react'

import { addTagsAction } from 'fixtures/macro'

import { AddTagsPreview } from '../AddTagsPreview'

describe('<AddTagsPreview />', () => {
    it('should render tags preview', () => {
        render(<AddTagsPreview addTagsAction={addTagsAction} />)

        expect(screen.getByText('Add tags:')).toBeInTheDocument()

        addTagsAction.arguments.tags!.split(',').forEach((tag) => {
            expect(screen.getByText(tag)).toBeInTheDocument()
        })
    })

    it('should return null when no tags action is provided', () => {
        const { container } = render(
            <AddTagsPreview addTagsAction={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle single tag', () => {
        const singleTagAction = {
            ...addTagsAction,
            arguments: { tags: 'urgent' },
        }

        render(<AddTagsPreview addTagsAction={singleTagAction} />)

        expect(screen.getByText('Add tags:')).toBeInTheDocument()
        expect(screen.getByText('urgent')).toBeInTheDocument()
    })

    it('should handle multiple tags with spaces', () => {
        const multipleTagsAction = {
            ...addTagsAction,
            arguments: { tags: 'urgent, high-priority, customer-issue' },
        }

        render(<AddTagsPreview addTagsAction={multipleTagsAction} />)

        expect(screen.getByText('Add tags:')).toBeInTheDocument()
        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('high-priority')).toBeInTheDocument()
        expect(screen.getByText('customer-issue')).toBeInTheDocument()
    })
})
