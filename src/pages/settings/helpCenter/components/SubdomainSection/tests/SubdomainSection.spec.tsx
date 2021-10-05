import React from 'react'
import {render} from '@testing-library/react'

import {SubdomainSection} from '../SubdomainSection'
import {HELP_CENTER_DOMAIN} from '../../../constants'

function getSubdomainInput(component: JSX.Element): HTMLInputElement {
    const {getByRole} = render(component)
    return getByRole('textbox') as HTMLInputElement
}

describe('<SubdomainSection />', () => {
    it('renders the default domain name if no domain is passed', async () => {
        const {findByText} = render(
            <SubdomainSection value="" href="" onChange={jest.fn} />
        )

        await findByText(HELP_CENTER_DOMAIN)
    })

    it('renders the subdomain value in the input', () => {
        const {value} = getSubdomainInput(
            <SubdomainSection value="my-domain" href="" onChange={jest.fn} />
        )

        expect(value).toEqual('my-domain')
    })

    it('renders the placeholder if value is missing', () => {
        const {placeholder} = getSubdomainInput(
            <SubdomainSection
                value=""
                href=""
                placeholder="input something"
                onChange={jest.fn}
            />
        )

        expect(placeholder).toEqual('input something')
    })

    describe('when subdomain has errors', () => {
        it('renders the error message', () => {
            const {getByTestId} = render(
                <SubdomainSection
                    value="domain-test"
                    href=""
                    onChange={jest.fn}
                    isValid={false}
                />
            )

            getByTestId('error-message')
        })
    })
})
