import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import provideToolbarPlugin from '../provideToolbarPlugin'
import type { InjectedProps, RequiredProps } from '../provideToolbarPlugin'

function TestComponent(props: RequiredProps & InjectedProps) {
    return (
        <div>
            <span data-is-open={props.linkIsOpen}>
                {props.linkIsOpen ? 'open' : 'closed'}
            </span>
            <span>{props.linkText || 'no-text'}</span>
            <span>{props.linkUrl || 'no-url'}</span>
            <span>{props.linkTarget || 'no-target'}</span>
            <button onClick={props.onLinkOpen}>open link</button>
            <button onClick={props.onLinkClose}>close link</button>
            <button onClick={() => props.onLinkTextChange('new text')}>
                set text
            </button>
            <button onClick={() => props.onLinkUrlChange('https://test.com')}>
                set url
            </button>
            <button onClick={() => props.onLinkTargetChange('_self')}>
                set target
            </button>
            <span>{typeof props.createToolbarPlugin}</span>
        </div>
    )
}

const Wrapped = provideToolbarPlugin(TestComponent)

describe('provideToolbarPlugin', () => {
    it('should render with initial state', () => {
        render(<Wrapped />)

        expect(screen.getByText('closed')).toBeInTheDocument()
        expect(screen.getByText('no-text')).toBeInTheDocument()
        expect(screen.getByText('no-url')).toBeInTheDocument()
        expect(screen.getByText('_blank')).toBeInTheDocument()
        expect(screen.getByText('function')).toBeInTheDocument()
    })

    it('should open link when onLinkOpen is called', async () => {
        const user = userEvent.setup()
        render(<Wrapped />)

        await user.click(screen.getByRole('button', { name: 'open link' }))

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should reset state when onLinkClose is called', async () => {
        const user = userEvent.setup()
        render(<Wrapped />)

        await user.click(screen.getByRole('button', { name: 'open link' }))
        expect(screen.getByText('open')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'close link' }))
        expect(screen.getByText('closed')).toBeInTheDocument()
        expect(screen.getByText('no-text')).toBeInTheDocument()
        expect(screen.getByText('no-url')).toBeInTheDocument()
        expect(screen.getByText('_blank')).toBeInTheDocument()
    })

    it('should update link text', async () => {
        const user = userEvent.setup()
        render(<Wrapped />)

        await user.click(screen.getByRole('button', { name: 'set text' }))

        expect(screen.getByText('new text')).toBeInTheDocument()
    })

    it('should update link url', async () => {
        const user = userEvent.setup()
        render(<Wrapped />)

        await user.click(screen.getByRole('button', { name: 'set url' }))

        expect(screen.getByText('https://test.com')).toBeInTheDocument()
    })

    it('should update link target', async () => {
        const user = userEvent.setup()
        render(<Wrapped />)

        await user.click(screen.getByRole('button', { name: 'set target' }))

        expect(screen.getByText('_self')).toBeInTheDocument()
    })

    it('should provide createToolbarPlugin function', () => {
        render(<Wrapped />)

        expect(screen.getByText('function')).toBeInTheDocument()
    })
})
