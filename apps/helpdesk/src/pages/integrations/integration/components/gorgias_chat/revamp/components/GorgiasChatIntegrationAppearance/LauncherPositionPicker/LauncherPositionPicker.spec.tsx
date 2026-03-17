import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'
import type { GorgiasChatPosition } from 'models/integration/types'

import { LauncherPositionPicker } from './LauncherPositionPicker'

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

        expect(screen.getByText('Launcher position')).toBeInTheDocument()
        expect(
            screen.getByText('Control where the launcher sits on your page.'),
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
        expect(textboxes[0]).toHaveValue('Bottom right')
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

    it('should use default values when value has undefined fields', () => {
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{} as GorgiasChatPosition}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        expect(textboxes[1]).toHaveValue('0')
        expect(textboxes[2]).toHaveValue('0')
    })

    it('should fall back to first option when alignment does not match any option', () => {
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{
                    ...defaultPosition,
                    alignment: 'unknown' as GorgiasChatPositionAlignmentEnum,
                }}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        expect(textboxes[0]).toHaveValue('Bottom right')
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

    it('should render all position options in dropdown', async () => {
        render(<LauncherPositionPicker {...defaultProps} />)

        const textboxes = screen.getAllByRole('textbox')
        await act(() => userEvent.click(textboxes[0]))

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

    it('should call onChange when horizontal input is changed', async () => {
        const onChange = jest.fn()
        render(<LauncherPositionPicker {...defaultProps} onChange={onChange} />)

        const textboxes = screen.getAllByRole('textbox')
        await act(() => userEvent.type(textboxes[1], '5'))

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
        await act(() => userEvent.type(textboxes[2], '5'))

        expect(onChange).toHaveBeenCalled()
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
        expect(lastCall).toHaveProperty('offsetX')
        expect(lastCall).toHaveProperty('offsetY')
        expect(lastCall).toHaveProperty('alignment')
    })

    it('should treat non-numeric input as 0', async () => {
        const onChange = jest.fn()
        render(
            <LauncherPositionPicker
                {...defaultProps}
                value={{ ...defaultPosition, offsetX: 0 }}
                onChange={onChange}
            />,
        )

        const textboxes = screen.getAllByRole('textbox')
        await act(() => userEvent.type(textboxes[1], 'abc'))

        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
        expect(lastCall.offsetX).toBe(0)
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
        await userEvent.type(textboxes[1], '{ArrowUp}')

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
        await userEvent.type(textboxes[1], '{ArrowDown}')

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
        await userEvent.type(textboxes[2], '{ArrowUp}')

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
        await userEvent.type(textboxes[2], '{ArrowDown}')

        expect(onChange).toHaveBeenCalledWith({
            ...defaultPosition,
            offsetY: 19,
        })
    })
})
