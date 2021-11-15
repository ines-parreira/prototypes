import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import LinkAlert from '../LinkAlert'

describe('<LinkAlert />', () => {
    it('should render an alert with with an action label', () => {
        const {container} = render(
            <LinkAlert actionLabel="Click here !">This is an alert!</LinkAlert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an alert with with an internal route', () => {
        const {container} = render(
            <LinkAlert
                actionLabel="Click here !"
                actionHref="/app/settings/profile"
            >
                This is an alert!
            </LinkAlert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an alert with with an external link', () => {
        const {container} = render(
            <LinkAlert
                actionLabel="Click here !"
                actionHref="https://www.gorgias.com"
            >
                This is an alert!
            </LinkAlert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an alert with with a clickable action on the action link ', () => {
        const onAction = jest.fn()
        const {getByText} = render(
            <LinkAlert actionLabel="Click here !" onAction={onAction}>
                This is an alert!
            </LinkAlert>
        )
        fireEvent.click(getByText('Click here !'))
        expect(onAction).toHaveBeenCalled()
    })
})
