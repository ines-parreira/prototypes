import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'
import type { GorgiasChatPosition } from 'models/integration/types'

import { LauncherPositionPicker } from '../LauncherPositionPicker'

const defaultPosition: GorgiasChatPosition = {
    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
    offsetX: 0,
    offsetY: 0,
}

const defaultProps = {
    value: defaultPosition,
    onChange: jest.fn(),
}

describe('<LauncherPositionPicker />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the title and description', () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        expect(screen.getByText('Chat launcher position')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose where the chat bubble appears on your site.',
            ),
        ).toBeInTheDocument()
    })

    it('should render all three fields', () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        expect(screen.getByText('Position')).toBeInTheDocument()
        expect(screen.getByText('Move horizontally')).toBeInTheDocument()
        expect(screen.getByText('Move vertically')).toBeInTheDocument()
    })

    it('should display the selected position alignment', () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        const textboxes = screen.getAllByRole('textbox')
        const positionSelect = textboxes[0]
        expect(positionSelect).toHaveValue('Bottom right')
    })

    it('should display offset values', () => {
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 10, offsetY: 20 }}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        expect(textboxes[1]).toHaveValue('10')
        expect(textboxes[2]).toHaveValue('20')
    })

    it('should display px suffix visually', () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        expect(screen.getAllByText('px')).toHaveLength(2)
    })

    it('should call onChange with new alignment when position is changed', async () => {
        const onChange = jest.fn()
        render(<LauncherPositionPicker {...defaultProps} onChange={onChange} />)

        const textboxes = screen.getAllByRole('textbox')
        const positionSelect = textboxes[0]

        await act(() => userEvent.click(positionSelect))
        await act(() =>
            userEvent.click(
                screen.getByRole('option', { name: /bottom left/i }),
            ),
        )

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
        })
    })

    it('should call onChange when horizontal input is changed', async () => {
        const onChange = jest.fn()
        render(<LauncherPositionPicker {...defaultProps} onChange={onChange} />)

        const textboxes = screen.getAllByRole('textbox')
        const horizontalInput = textboxes[1]

        await act(() => userEvent.type(horizontalInput, '5'))

        expect(onChange).toHaveBeenCalled()
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
        expect(lastCall).toHaveProperty('offsetX')
        expect(lastCall).toHaveProperty('offsetY')
        expect(lastCall).toHaveProperty('alignment')
    })

    it('should call onChange when vertical input is changed', async () => {
        const onChange = jest.fn()
        render(<LauncherPositionPicker {...defaultProps} onChange={onChange} />)

        const textboxes = screen.getAllByRole('textbox')
        const verticalInput = textboxes[2]

        await act(() => userEvent.type(verticalInput, '5'))

        expect(onChange).toHaveBeenCalled()
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
        expect(lastCall).toHaveProperty('offsetX')
        expect(lastCall).toHaveProperty('offsetY')
        expect(lastCall).toHaveProperty('alignment')
    })

    it('should display correct numeric values', () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 25, offsetY: 15 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        expect(textboxes[1]).toHaveValue('25')
        expect(textboxes[2]).toHaveValue('15')
    })

    it('should handle zero values', () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 0, offsetY: 0 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        expect(textboxes[1]).toHaveValue('0')
        expect(textboxes[2]).toHaveValue('0')
    })

    it('should render all position options in dropdown', async () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        const textboxes = screen.getAllByRole('textbox')
        const positionSelect = textboxes[0]

        await act(() => userEvent.click(positionSelect))

        expect(
            screen.getByRole('option', { name: /bottom right/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /bottom left/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /top right/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /top left/i }),
        ).toBeInTheDocument()
    })

    it('should increment horizontal offset when pressing ArrowUp', async () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 10 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        const horizontalInput = textboxes[1]

        await userEvent.type(horizontalInput, '{ArrowUp}')

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            offsetX: 11,
        })
    })

    it('should decrement horizontal offset when pressing ArrowDown', async () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 10 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        const horizontalInput = textboxes[1]

        await userEvent.type(horizontalInput, '{ArrowDown}')

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            offsetX: 9,
        })
    })

    it('should increment vertical offset when pressing ArrowUp', async () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetY: 20 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        const verticalInput = textboxes[2]

        await userEvent.type(verticalInput, '{ArrowUp}')

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            offsetY: 21,
        })
    })

    it('should decrement vertical offset when pressing ArrowDown', async () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetY: 20 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        const verticalInput = textboxes[2]

        await userEvent.type(verticalInput, '{ArrowDown}')

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            offsetY: 19,
        })
    })
})
