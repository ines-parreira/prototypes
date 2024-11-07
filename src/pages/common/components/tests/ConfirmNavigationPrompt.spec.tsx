import {act, render} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'
import {Router} from 'react-router-dom'

import {ConfirmNavigationPrompt} from '../ConfirmNavigationPrompt'

const history = createMemoryHistory({initialEntries: ['/']})

const defaultProps = {
    title: 'Confirm Navigation',
    bodyText: 'Are you sure you want to leave?',
    cancelLabel: 'Cancel',
    confirmLabel: 'Confirm',
}

const renderComponent = (enabled: boolean) =>
    render(
        <Router history={history}>
            <ConfirmNavigationPrompt {...defaultProps} enabled={enabled} />
        </Router>
    )

describe('ConfirmNavigationPrompt', () => {
    it('stops navigation and renders prompt when trying to navigate to another page', () => {
        const {queryByText} = renderComponent(true)

        expect(queryByText(defaultProps.title)).not.toBeInTheDocument()
        expect(queryByText(defaultProps.bodyText)).not.toBeInTheDocument()
        expect(queryByText(defaultProps.cancelLabel)).not.toBeInTheDocument()
        expect(queryByText(defaultProps.confirmLabel)).not.toBeInTheDocument()

        act(() => {
            history.push('/test')
        })

        expect(history.location.pathname).toBe('/')

        expect(queryByText(defaultProps.title)).toBeInTheDocument()
        expect(queryByText(defaultProps.bodyText)).toBeInTheDocument()
        expect(queryByText(defaultProps.cancelLabel)).toBeInTheDocument()
        expect(queryByText(defaultProps.confirmLabel)).toBeInTheDocument()
    })

    it('does not stop navigation and does not render prompt when not enabled', () => {
        const {queryByText} = renderComponent(false)

        act(() => {
            history.push('/test')
        })

        expect(history.location.pathname).toBe('/test')
        expect(queryByText(defaultProps.bodyText)).not.toBeInTheDocument()
    })
})
