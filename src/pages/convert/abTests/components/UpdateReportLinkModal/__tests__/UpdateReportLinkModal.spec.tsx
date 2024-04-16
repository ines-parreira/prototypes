import React from 'react'
import {fireEvent, render, act} from '@testing-library/react'

import UpdateReportLinkModal from '../UpdateReportLinkModal'

describe('UpdateReportLinkModal', () => {
    it('validation error', () => {
        const onSubmit = jest.fn()
        const {getByTestId, getByLabelText} = render(
            <UpdateReportLinkModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(getByTestId('ab-test-update-btn')).toBeInTheDocument()

        // Update Event
        fireEvent.change(getByLabelText('report link'), {
            target: {value: 'lorem ipsum'},
        })

        act(() => {
            fireEvent.click(getByTestId('ab-test-update-btn'))
            expect(onSubmit).toHaveBeenCalledTimes(0)
        })
    })

    it('updates data', () => {
        const onSubmit = jest.fn()
        const {getByTestId, getByLabelText} = render(
            <UpdateReportLinkModal
                isOpen={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        )

        expect(getByTestId('ab-test-update-btn')).toBeInTheDocument()

        // Update Event
        fireEvent.change(getByLabelText('report link'), {
            target: {value: 'https://example.com'},
        })

        act(() => {
            fireEvent.click(getByTestId('ab-test-update-btn'))
            expect(onSubmit).toHaveBeenCalledTimes(1)
        })
    })
})
