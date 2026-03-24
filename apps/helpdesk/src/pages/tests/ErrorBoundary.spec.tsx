import type { ComponentProps } from 'react'
import React from 'react'

import { reportError } from '@repo/logging'
import { fireEvent, render } from '@testing-library/react'
import type { Collapse } from 'reactstrap'

import {
    ErrorBoundary,
    RELOAD_BUTTON_TEXT,
    SHOW_DETAILS_BUTTON_TEXT,
    SUBHEADER,
} from '../ErrorBoundary'

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')
    return {
        ...reactstrap,
        Collapse: ({ isOpen, children }: ComponentProps<typeof Collapse>) => {
            return isOpen ? children : null
        },
    }
})

jest.mock('@repo/logging')

describe('<ErrorBoundary/>', () => {
    const noErrorChildText = 'foo'
    const NoErrorChild = () => <div>{noErrorChildText}</div>
    const error = new Error('foo')
    const ErrorChild = () => {
        throw error
    }
    it('should render children when there is no error', () => {
        const { queryByText } = render(
            <ErrorBoundary>
                <NoErrorChild />
            </ErrorBoundary>,
        )

        expect(queryByText(noErrorChildText)).toBeInTheDocument()
        expect(queryByText(SUBHEADER)).not.toBeInTheDocument()
    })

    it('should render an error message because an error occurred', () => {
        const { queryByText } = render(
            <ErrorBoundary>
                <ErrorChild />
            </ErrorBoundary>,
        )

        expect(queryByText(noErrorChildText)).not.toBeInTheDocument()
        expect(queryByText(SUBHEADER)).toBeInTheDocument()
    })

    it('should report error', () => {
        const tags = {
            foo: 'bar',
        }
        render(
            <ErrorBoundary sentryTags={tags}>
                <ErrorChild />
            </ErrorBoundary>,
        )

        expect(reportError).toHaveBeenCalledWith(error, {
            extra: expect.any(Object),
            tags,
        })
    })

    it('should reload page on reload page button click', () => {
        const { getByRole } = render(
            <ErrorBoundary>
                <ErrorChild />
            </ErrorBoundary>,
        )

        fireEvent.click(getByRole('button', { name: RELOAD_BUTTON_TEXT }))

        expect(window.location.reload).toHaveBeenCalled()
    })

    it('should show the error details on show details button click', () => {
        const { getByRole, queryByText } = render(
            <ErrorBoundary>
                <ErrorChild />
            </ErrorBoundary>,
        )

        expect(queryByText(error.toString())).not.toBeInTheDocument()

        fireEvent.click(getByRole('button', { name: SHOW_DETAILS_BUTTON_TEXT }))

        expect(queryByText(error.toString())).toBeInTheDocument()
    })
})
