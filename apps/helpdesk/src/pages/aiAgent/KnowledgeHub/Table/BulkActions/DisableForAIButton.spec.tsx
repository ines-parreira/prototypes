import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DisableForAIButton } from './DisableForAIButton'
import { ButtonRenderMode } from './types'

describe('DisableForAIButton', () => {
    it('should render button with correct text', () => {
        render(<DisableForAIButton onClick={jest.fn()} isDisabled={false} />)

        expect(
            screen.getByRole('button', { name: /disable for ai agent/i }),
        ).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const onClick = jest.fn()
        render(<DisableForAIButton onClick={onClick} isDisabled={false} />)

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: /disable for ai agent/i }),
            )
        })

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when isDisabled is true', () => {
        render(<DisableForAIButton onClick={jest.fn()} isDisabled={true} />)

        expect(
            screen.getByRole('button', { name: /disable for ai agent/i }),
        ).toBeDisabled()
    })

    it('should render button when renderMode is Visible', () => {
        render(
            <DisableForAIButton
                onClick={jest.fn()}
                isDisabled={false}
                renderMode={ButtonRenderMode.Visible}
            />,
        )

        expect(
            screen.getByRole('button', { name: /disable for ai agent/i }),
        ).toBeInTheDocument()
    })

    it('should not render button when renderMode is Hidden', () => {
        const { container } = render(
            <DisableForAIButton
                onClick={jest.fn()}
                isDisabled={false}
                renderMode={ButtonRenderMode.Hidden}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /disable for ai agent/i }),
        ).not.toBeInTheDocument()
        expect(container.firstChild).toBeNull()
    })

    it('should render disabled button with tooltip when renderMode is DisabledWithTooltip', () => {
        const tooltipMessage = 'This action is not supported'

        render(
            <DisableForAIButton
                onClick={jest.fn()}
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
                tooltipMessage={tooltipMessage}
            />,
        )

        const button = screen.getByRole('button', {
            name: /disable for ai agent/i,
        })
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
    })

    it('should not call onClick when button is disabled with tooltip', async () => {
        const onClick = jest.fn()

        render(
            <DisableForAIButton
                onClick={onClick}
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
                tooltipMessage="Cannot perform action"
            />,
        )

        const button = screen.getByRole('button', {
            name: /disable for ai agent/i,
        })

        await act(async () => {
            await userEvent.click(button)
        })

        expect(onClick).not.toHaveBeenCalled()
    })
})
