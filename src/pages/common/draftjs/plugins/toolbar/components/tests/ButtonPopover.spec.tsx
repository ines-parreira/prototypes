import {render, screen} from '@testing-library/react'
import React from 'react'

import ButtonPopover from '../ButtonPopover'

/* eslint-disable @typescript-eslint/no-unsafe-return */
jest.mock('reactstrap', () => ({
    ...jest.requireActual('reactstrap'),
    Popover: jest.fn(
        ({
            children,
            toggle,
        }: {
            children: React.ReactNode
            toggle: () => void
        }) => <div onClick={toggle}>{children}</div>
    ),
}))

describe('ButtonPopover', () => {
    it('should render', () => {
        render(
            <ButtonPopover
                toggleGuard={jest.fn()}
                onClose={jest.fn()}
                onOpen={jest.fn()}
                isOpen={false}
                name="test"
                icon="test"
            >
                <div>Button</div>
            </ButtonPopover>
        )
        expect(screen.getByText('Button')).toBeInTheDocument()
    })

    it('should call onClose when clicking the button', () => {
        const onClose = jest.fn()
        render(
            <ButtonPopover
                toggleGuard={jest.fn(() => false)}
                onClose={onClose}
                onOpen={jest.fn()}
                isOpen={true}
                name="test"
                icon="test"
            >
                <div>Button</div>
            </ButtonPopover>
        )

        screen.getByText('Button').click()
        expect(onClose).toHaveBeenCalled()
    })

    it('should not call onClose when toggleGuard returns true', () => {
        const onClose = jest.fn()
        render(
            <ButtonPopover
                toggleGuard={jest.fn(() => true)}
                onClose={onClose}
                onOpen={jest.fn()}
                isOpen={true}
                name="test"
                icon="test"
            >
                <div>Button</div>
            </ButtonPopover>
        )

        screen.getByText('Button').click()
        expect(onClose).not.toHaveBeenCalled()
    })
})
