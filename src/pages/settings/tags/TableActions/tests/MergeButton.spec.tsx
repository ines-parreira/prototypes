import {fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {tags} from 'fixtures/tag'

import MergeButton from '../MergeButton'

const props: ComponentProps<typeof MergeButton> = {
    selectedTagsText: 'refund and billing',
    tags: Object.assign({}, ...tags.map((tag) => ({[tag.id]: tag}))),
    selectedTagsIds: fromJS([1, 2, 3]),
    onMerge: jest.fn(),
}

describe('<MergeButton />', () => {
    it('should be disabled when selected count is < 2', () => {
        render(<MergeButton {...props} selectedTagsIds={fromJS([1])} />)

        expect(screen.getByText('Merge').closest('button')).toHaveClass(
            'isDisabled'
        )
    })

    it('should merge tags after confirmation prompt', () => {
        render(<MergeButton {...props} />)

        fireEvent.click(screen.getByText('Merge'))
        expect(
            screen.getByText(/You are about to merge 2 tags/).textContent
        ).toBe(
            'You are about to merge 2 tags (refund and billing) into rejected.This action cannot be undone.'
        )

        fireEvent.click(screen.getByText('Confirm'))
        expect(props.onMerge).toHaveBeenCalled()
    })
})
