import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SelectCustomerVisibility from '../SelectVisibilityStatus'

const onChange = jest.fn()
const setShowNotification = jest.fn()

describe('<SelectCustomerVisibility />', () => {
    beforeEach(() => {
        onChange.mockClear()
        setShowNotification.mockClear()
    })

    it('should render with correct initial value', () => {
        render(
            <SelectCustomerVisibility
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getAllByDisplayValue('Public')[0]
        expect(input).toBeInTheDocument()
    })

    it('should render unlisted as initial value', () => {
        render(
            <SelectCustomerVisibility
                status="UNLISTED"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getAllByDisplayValue('Unlisted')[0]
        expect(input).toBeInTheDocument()
    })

    it('should show the notification popup', async () => {
        const user = userEvent.setup()

        render(
            <SelectCustomerVisibility
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={true}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={true}
            />,
        )

        const gotItButton = screen.getByRole('button', { name: /got it/i })
        expect(gotItButton).toBeInTheDocument()

        await user.click(gotItButton)

        expect(setShowNotification).toHaveBeenCalled()
    })

    it('should show "(currently Unlisted)" when parent is unlisted', () => {
        render(
            <SelectCustomerVisibility
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={true}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getAllByDisplayValue(
            'Public (currently Unlisted)',
        )[0]
        expect(input).toBeInTheDocument()
    })

    it('should be disabled when isDisabled is true', () => {
        render(
            <SelectCustomerVisibility
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
                isDisabled={true}
            />,
        )

        const input = screen.getAllByDisplayValue('Public')[0]
        expect(input).toBeDisabled()
    })

    it('should default to PUBLIC when status prop is not provided', () => {
        render(
            <SelectCustomerVisibility
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getAllByDisplayValue('Public')[0]
        expect(input).toBeInTheDocument()
    })
})
