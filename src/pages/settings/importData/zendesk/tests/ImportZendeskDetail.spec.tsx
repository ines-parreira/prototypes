import React from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'

import {fromJS} from 'immutable'

import {ImportZendeskDetail} from '../ImportZendeskDetail'

const defaultProps = {
    zendeskRedirectUri: 'https://redirect-uri.com/',
    integrations: fromJS([new Map([['name', 'acme']])]),
}

const renderComponent = (props: typeof defaultProps): RenderResult => {
    return render(<ImportZendeskDetail {...props} />)
}

describe('<ImportZendeskDetail/>', () => {
    describe('rendering', () => {
        it('without any errors and disabled redirect button', () => {
            const {getByText} = renderComponent(defaultProps)
            expect(
                getByText('Add domain').getAttribute('disabled')
            ).toBeDefined()
        })

        it('with error because domain already exists', () => {
            const {getByLabelText, getByText} = renderComponent(defaultProps)
            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: {value: 'acme'},
            })

            expect(getByText('This domain was already imported.')).toBeDefined()
            expect(
                getByText('Add domain').getAttribute('disabled')
            ).toBeDefined()
        })

        it('with active button and redirecting href', () => {
            window.location.assign = jest.fn()

            const {getByLabelText, getByText} = renderComponent(defaultProps)
            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: {value: 'gorgias'},
            })

            const element = getByText('Add domain')
            expect(element.getAttribute('disabled')).toBeNull()

            fireEvent.submit(element.parentElement as HTMLElement)
            expect(window.location.assign).toBeCalledWith(
                defaultProps.zendeskRedirectUri + '?domain=gorgias'
            )
        })
    })
})
