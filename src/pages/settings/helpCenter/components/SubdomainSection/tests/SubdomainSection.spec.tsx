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
            <SubdomainSection value="" caption="" onChange={jest.fn} />
        )

        await findByText(HELP_CENTER_DOMAIN)
    })

    it('renders the subdomain value in the input', () => {
        const {value} = getSubdomainInput(
            <SubdomainSection value="my-domain" caption="" onChange={jest.fn} />
        )

        expect(value).toEqual('my-domain')
    })

    it('renders the placeholder if value is missing', () => {
        const {placeholder} = getSubdomainInput(
            <SubdomainSection
                value=""
                caption=""
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
                    caption=""
                    onChange={jest.fn}
                    error={
                        'Subdomain is invalid or contains forbidden keywords'
                    }
                />
            )

            getByTestId('error-message')
        })
    })
})
