import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DeleteButton } from './DeleteButton'
import { ButtonRenderMode } from './types'

describe('DeleteButton', () => {
    it('should render button', () => {
        render(<DeleteButton onClick={jest.fn()} isDisabled={false} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const onClick = jest.fn()
        render(<DeleteButton onClick={onClick} isDisabled={false} />)

        await act(async () => {
            await userEvent.click(screen.getByRole('button'))
        })

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when isDisabled is true', () => {
        render(<DeleteButton onClick={jest.fn()} isDisabled={true} />)

        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should render button when renderMode is Visible', () => {
        render(
            <DeleteButton
                onClick={jest.fn()}
                isDisabled={false}
                renderMode={ButtonRenderMode.Visible}
            />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render null when renderMode is Hidden', () => {
        const { container } = render(
            <DeleteButton
                onClick={jest.fn()}
                isDisabled={false}
                renderMode={ButtonRenderMode.Hidden}
            />,
        )

        expect(container.firstChild).toBeNull()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render button with tooltip wrapper when renderMode is DisabledWithTooltip', () => {
        render(
            <DeleteButton
                onClick={jest.fn()}
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
                tooltipMessage="Cannot delete snippets"
            />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not render tooltip when renderMode is DisabledWithTooltip but no message provided', () => {
        render(
            <DeleteButton
                onClick={jest.fn()}
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
            />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeDisabled()
    })
})
