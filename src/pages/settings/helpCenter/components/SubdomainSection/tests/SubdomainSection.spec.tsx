import React from 'react'
import {render} from '@testing-library/react'

import {SubdomainSection} from '../SubdomainSection'
import {HELP_CENTER_DOMAIN} from '../../../constants'

function getInputFrom(
    component: JSX.Element,
    testId: string
): HTMLInputElement {
    const {getByTestId} = render(component)
    return getByTestId(testId) as HTMLInputElement
}

describe('<SubdomainSection />', () => {
    it('renders the domain name', () => {
        const {getByTestId} = render(
            <SubdomainSection
                value=""
                href=""
                domain="test.com"
                onChange={jest.fn}
            />
        )
        expect(getByTestId('domain-name').textContent).toEqual('test.com')
    })

    it('renders the default domain name if no domain is passed', () => {
        const {getByTestId} = render(
            <SubdomainSection value="" href="" onChange={jest.fn} />
        )
        expect(getByTestId('domain-name').textContent).toEqual(
            HELP_CENTER_DOMAIN
        )
    })

    it('renders the subdomain value in the input', () => {
        const {value} = getInputFrom(
            <SubdomainSection value="my-domain" href="" onChange={jest.fn} />,
            'subdomain-input'
        )
        expect(value).toEqual('my-domain')
    })

    it('renders the placeholder if value is missing', () => {
        const {placeholder} = getInputFrom(
            <SubdomainSection
                value=""
                href=""
                placeholder="input something"
                onChange={jest.fn}
            />,
            'subdomain-input'
        )
        expect(placeholder).toEqual('input something')
    })

    describe('when subdomain has errors', () => {
        it('renders the error message', () => {
            const {getByTestId} = render(
                <SubdomainSection
                    value="my-domain"
                    href=""
                    hasError
                    onChange={jest.fn}
                />
            )
            getByTestId('error-message')
        })
    })
})
