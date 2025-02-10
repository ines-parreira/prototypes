import {fireEvent, render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import React from 'react'

import {Expander, ExpanderProps} from '../Expander'

const defaultProps = {
    isLoading: false,
    isExpanded: false,
    tasksCount: 6,
    onClick: jest.fn(),
    controlId: 'test',
}

const getSkeleton = () => document.querySelector('.react-loading-skeleton')
const getButton = () => document.querySelector('button') as HTMLButtonElement

const renderTemplate = (props: ExpanderProps = defaultProps) =>
    render(<Expander {...props} />)

describe('Expander', () => {
    it('render the section in loading', () => {
        renderTemplate({...defaultProps, isLoading: true})

        expect(getSkeleton()).toBeInTheDocument()
    })

    it('render the component after loading', () => {
        renderTemplate()

        expect(getSkeleton()).toBeNull()
        expect(screen.getByText('Show all tasks (6 total)')).toBeInTheDocument()
        expect(screen.queryByText('Collapse')).toBeNull()
    })

    it('render the component after loading with no tasksCount', () => {
        renderTemplate({...defaultProps, tasksCount: undefined})

        expect(getSkeleton()).toBeNull()
        expect(screen.getByText('Show all tasks (0 total)')).toBeInTheDocument()
        expect(screen.queryByText('Collapse')).toBeNull()
    })

    it('should expand when clicking on expand button', () => {
        renderTemplate({...defaultProps, isExpanded: true})

        act(() => {
            fireEvent.click(getButton())
        })

        expect(getButton()).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByText('Show all tasks (6 total)')).toBeNull()
        expect(screen.getByText('Collapse')).toBeInTheDocument()
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
