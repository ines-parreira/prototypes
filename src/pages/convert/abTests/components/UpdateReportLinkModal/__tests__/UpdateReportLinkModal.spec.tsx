import {fireEvent, render, act, screen} from '@testing-library/react'
import React from 'react'

import UpdateReportLinkModal from '../UpdateReportLinkModal'

describe('UpdateReportLinkModal', () => {
    it('validation error', () => {
        const onSubmit = jest.fn()
        const {getByLabelText} = render(
            <UpdateReportLinkModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(screen.getByText('Save changes')).toBeInTheDocument()

        // Update Event
        fireEvent.change(getByLabelText('Report link'), {
            target: {value: 'lorem ipsum'},
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
            expect(onSubmit).toHaveBeenCalledTimes(0)
        })
    })

    it('updates data', () => {
        const onSubmit = jest.fn()
        const {getByLabelText} = render(
            <UpdateReportLinkModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(screen.getByText('Save changes')).toBeInTheDocument()

        // Update Event
        fireEvent.change(getByLabelText('Report link'), {
            target: {value: 'https://example.com'},
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
            expect(onSubmit).toHaveBeenCalledTimes(1)
        })
    })
})
