import React from 'react'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
} from '@testing-library/react'

import {getSingleHelpcenterResponseFixture as helpCenter} from '../../../../fixtures/getHelpcenterResponse.fixture'
import {HelpCenterCategory} from '../HelpCenterCategory'
import {HELP_CENTER_DOMAIN} from '../../../../constants'
type Props = {
    isOpen?: boolean
    getCategory?: () => Promise<unknown>
}

const Example = ({
    isOpen = false,
    getCategory = () =>
        new Promise((resolve) => {
            resolve('')
        }),
}: Props) => {
    const [open, setOpen] = React.useState(isOpen)

    return (
        <>
            <button data-testid="toggle-btn" onClick={() => setOpen(true)}>
                Click me
            </button>
            <HelpCenterCategory
                isOpen={open}
                helpCenter={helpCenter}
                getCategory={getCategory}
                onClose={() => setOpen(false)}
            />
        </>
    )
}

async function renderAndWait(props: Props) {
    const payload = render(<Example {...props} />)

    await waitForElementToBeRemoved(() => payload.getByTestId('spinner-loader'))

    return payload
}

describe('<HelpCenterCategory>', () => {
    it('renders in a hidden state by default', () => {
        const {getByTestId} = render(
            <HelpCenterCategory
                isOpen={false}
                helpCenter={helpCenter}
                getCategory={jest.fn(() => Promise.resolve())}
                onClose={jest.fn()}
            />
        )

        expect(getByTestId('category-edit').className).toEqual('drawer closed')
    })

    it('appears when isOpen is true', async () => {
        const {getByTestId} = await renderAndWait({isOpen: true})

        expect(getByTestId('category-edit').className).toEqual('drawer opened')
    })

    it('focuses the Title input when in view', async () => {
        const {getByTestId} = await renderAndWait({isOpen: true})
        const titleInput = getByTestId('title-input')

        expect(document.activeElement).toEqual(titleInput)
    })

    describe('when the slug input is pristine', () => {
        it('autocomplete the Slug input when Title is changed', async () => {
            const {getByTestId} = await renderAndWait({isOpen: true})

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            expect(slugInput.value).toEqual('')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('about-us')
        })
    })

    describe('when the slug was touched', () => {
        it(`doesn't change the Slug input when Title is changed`, async () => {
            const {getByTestId} = await renderAndWait({isOpen: true})

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            fireEvent.change(getByTestId('slug-input'), {
                target: {
                    value: 'slug-1',
                },
            })

            expect(slugInput.value).toEqual('slug-1')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('slug-1')
        })
    })

    it('changes the language in the slug domain', async () => {
        const {getByTestId} = await renderAndWait({isOpen: true})

        expect(getByTestId('slug-domain').textContent).toEqual(
            `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/en-us`
        )

        fireEvent.click(getByTestId('dropdown-select-trigger'))
        fireEvent.click(getByTestId('option-fr-FR'))

        expect(getByTestId('slug-domain').textContent).toEqual(
            `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/fr-fr`
        )
    })

    it('disables the Save button if Title or Slug are missing', async () => {
        const {getByTestId} = await renderAndWait({isOpen: true})
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })
        expect(button.disabled).toBeFalsy()
    })

    it('resets the fields when isOpen changes to false', async () => {
        const {getByTestId} = await renderAndWait({isOpen: true})
        const titleInput = getByTestId('title-input') as HTMLInputElement

        expect(titleInput.value).toEqual('')

        fireEvent.change(titleInput, {
            target: {
                value: 'About us',
            },
        })

        // Toggle the drawer to reset the state
        fireEvent.click(getByTestId('close-drawer'))
        fireEvent.click(getByTestId('toggle-btn'))

        expect(titleInput.value).toEqual('')
    })
})
