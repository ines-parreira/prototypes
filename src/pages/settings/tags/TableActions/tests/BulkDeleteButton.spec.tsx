import {fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import BulkDeleteButton from '../BulkDeleteButton'

const props: ComponentProps<typeof BulkDeleteButton> = {
    onBulkDelete: jest.fn(),
    selectedTagsCount: 1,
    selectedTagsText: 'refund',
}

describe('<BulkDeleteButton />', () => {
    it('should be disabled when selected count is 0', () => {
        render(<BulkDeleteButton {...props} selectedTagsCount={0} />)

        expect(screen.getByRole('button', {name: /Delete/})).toBeAriaDisabled()
    })

    it('should delete tags after confirmation prompt', () => {
        render(<BulkDeleteButton {...props} />)

        fireEvent.click(screen.getByText('Delete'))
        expect(
            screen.getByText(/You are about to delete 1 tag/).textContent
        ).toBe(
            'You are about to delete 1 tag: refund.It will be removed from all tickets.Historical Statistics for this tag will be lost.It will not be possible to add the tag back on the tickets they were on.The tag will have to be removed from Saved Filters manually.'
        )

        fireEvent.click(screen.getByText('Confirm'))
        expect(props.onBulkDelete).toHaveBeenCalled()
    })

    it('should display plural version of message', () => {
        render(
            <BulkDeleteButton
                {...props}
                selectedTagsCount={2}
                selectedTagsText="refund and billing"
            />
        )

        fireEvent.click(screen.getByText('Delete'))
        expect(
            screen.getByText(/You are about to delete 2 tags/).textContent
        ).toBe(
            'You are about to delete 2 tags: refund and billing.They will be removed from all tickets.Historical Statistics for these tags will be lost.It will not be possible to add the tags back on the tickets they were on.The tags will have to be removed from Saved Filters manually.'
        )

        fireEvent.click(screen.getByText('Confirm'))
        expect(props.onBulkDelete).toHaveBeenCalled()
    })
})
