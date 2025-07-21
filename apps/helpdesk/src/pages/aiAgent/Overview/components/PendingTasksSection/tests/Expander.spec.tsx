import { act, fireEvent, render, screen } from '@testing-library/react'

import { Expander, ExpanderProps } from '../Expander'

const defaultProps = {
    isLoading: false,
    isExpanded: false,
    onClick: jest.fn(),
    controlId: 'test',
}

const getSkeleton = () => document.querySelector('.react-loading-skeleton')
const getButton = () => document.querySelector('button') as HTMLButtonElement

const renderTemplate = (props: ExpanderProps = defaultProps) =>
    render(<Expander {...props} />)

describe('Expander', () => {
    it('render the section in loading', () => {
        renderTemplate({ ...defaultProps, isLoading: true })

        expect(getSkeleton()).toBeInTheDocument()
    })

    it('render the component after loading', () => {
        renderTemplate()

        expect(getSkeleton()).toBeNull()
        expect(screen.getByText('Show all')).toBeInTheDocument()
        expect(screen.queryByText('Show less')).toBeNull()
    })

    it('render the component after loading with no tasksCount', () => {
        renderTemplate({ ...defaultProps })

        expect(getSkeleton()).toBeNull()
        expect(screen.getByText('Show all')).toBeInTheDocument()
        expect(screen.queryByText('Show less')).toBeNull()
    })

    it('should expand when clicking on expand button', () => {
        renderTemplate({ ...defaultProps, isExpanded: true })

        act(() => {
            fireEvent.click(getButton())
        })

        expect(getButton()).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByText('Show all')).toBeNull()
        expect(screen.getByText('Show less')).toBeInTheDocument()
    })

    it('should call onClick when clicking on expand button', () => {
        const onClickMock = jest.fn()
        renderTemplate({
            ...defaultProps,
            isExpanded: true,
            onClick: onClickMock,
        })

        act(() => {
            fireEvent.click(getButton())
        })

        expect(onClickMock).toHaveBeenCalled()
    })
})
