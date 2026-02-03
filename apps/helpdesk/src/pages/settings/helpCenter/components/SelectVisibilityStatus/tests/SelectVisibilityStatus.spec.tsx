import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SelectVisibilityStatus from '../SelectVisibilityStatus'

const onChange = jest.fn()
const setShowNotification = jest.fn()

describe('<SelectVisibilityStatus />', () => {
    beforeEach(() => {
        onChange.mockClear()
        setShowNotification.mockClear()
    })

    it('should render with correct initial value', () => {
        render(
            <SelectVisibilityStatus
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getByRole('textbox', {
            name: /visibility status/i,
        })
        expect(input).toHaveValue('Public')
    })

    it('should render unlisted as initial value', () => {
        render(
            <SelectVisibilityStatus
                status="UNLISTED"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getByRole('textbox', {
            name: /visibility status/i,
        })
        expect(input).toHaveValue('Unlisted')
    })

    it('should show the notification popup', async () => {
        const user = userEvent.setup()

        render(
            <SelectVisibilityStatus
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
            <SelectVisibilityStatus
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={true}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getByRole('textbox', {
            name: /visibility status/i,
        })
        expect(input).toHaveValue('Public (currently Unlisted)')
    })

    it('should be disabled when isDisabled is true', () => {
        render(
            <SelectVisibilityStatus
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
                isDisabled={true}
            />,
        )

        const input = screen.getByRole('textbox', {
            name: /visibility status/i,
        })
        expect(input).toBeDisabled()
    })

    it('should default to PUBLIC when status prop is not provided', () => {
        render(
            <SelectVisibilityStatus
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />,
        )

        const input = screen.getByRole('textbox', {
            name: /visibility status/i,
        })
        expect(input).toHaveValue('Public')
    })
})
