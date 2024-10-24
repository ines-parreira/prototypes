import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import CreateABTestInfoModal from '../CreateABTestInfoModal'

describe('<CreateABTestInfoModal />', () => {
    it('renders', () => {
        const onClose = jest.fn()
        const onSubmit = jest.fn()
        const setIsDismissed = jest.fn()

        const {getByText, getByRole} = render(
            <CreateABTestInfoModal
                isOpen={true}
                isDismissed={false}
                onClose={onClose}
                onSubmit={onSubmit}
                setIsDismissed={setIsDismissed}
            />
        )

        expect(
            getByText('Create an A/B test from a campaign')
        ).toBeInTheDocument()

        const saveBtn = getByRole('button', {name: 'Create A/B test'})
        userEvent.click(saveBtn)
        expect(onSubmit).toBeCalled()

        const closeBtn = getByRole('button', {name: 'Cancel'})
        userEvent.click(closeBtn)

        expect(onClose).toBeCalled()
    })

    it('clicked dismiss', () => {
        const onClose = jest.fn()
        const onSubmit = jest.fn()
        const setIsDismissed = jest.fn()

        const {getByRole} = render(
            <CreateABTestInfoModal
                isOpen={true}
                isDismissed={false}
                onClose={onClose}
                onSubmit={onSubmit}
                setIsDismissed={setIsDismissed}
            />
        )

        const checkbox = getByRole('checkbox')
        const saveBtn = getByRole('button', {name: 'Create A/B test'})

        userEvent.click(checkbox)
        userEvent.click(saveBtn)

        expect(onSubmit).toBeCalled()
        expect(setIsDismissed).toBeCalled()
    })
})
