import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StartABTestModal from '../StartABTestModal'

describe('<StartABTestModal />', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()
    const setIsDismissed = jest.fn()

    it('renders', () => {
        const { getByText, getByRole } = render(
            <StartABTestModal
                isOpen={true}
                isDismissed={false}
                onClose={onClose}
                onSubmit={onSubmit}
                setIsDismissed={setIsDismissed}
            />,
        )
        expect(getByText('You’re about to start your test')).toBeInTheDocument()

        const btn = getByRole('button', { name: /Start Test/ })
        userEvent.click(btn)
        expect(onSubmit).toBeCalled()

        const closeBtn = getByRole('button', { name: 'Cancel' })
        userEvent.click(closeBtn)

        expect(onClose).toBeCalled()
    })

    it('clicked dismiss', () => {
        const onClose = jest.fn()
        const onSubmit = jest.fn()
        const setIsDismissed = jest.fn()

        const { getByRole } = render(
            <StartABTestModal
                isOpen={true}
                isDismissed={false}
                onClose={onClose}
                onSubmit={onSubmit}
                setIsDismissed={setIsDismissed}
            />,
        )

        const checkbox = getByRole('checkbox')
        const btn = getByRole('button', { name: /Start Test/ })
        userEvent.click(btn)

        userEvent.click(checkbox)
        userEvent.click(btn)

        expect(onSubmit).toBeCalled()
        expect(setIsDismissed).toBeCalled()
    })
})
