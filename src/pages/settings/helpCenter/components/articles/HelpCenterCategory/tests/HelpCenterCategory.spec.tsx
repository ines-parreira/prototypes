import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {getSingleHelpcenterResponseFixture as helpCenter} from '../../../../fixtures/getHelpcenterResponse.fixture'
import {HelpCenterCategory} from '../HelpCenterCategory'
type Props = {
    isOpen?: boolean
    getCategory?: () => Promise<unknown>
}

const Example = ({isOpen = false}: Props) => {
    const [open, setOpen] = React.useState(isOpen)

    return (
        <>
            <button data-testid="toggle-btn" onClick={() => setOpen(true)}>
                Click me
            </button>
            <HelpCenterCategory
                isOpen={open}
                isLoading={false}
                helpCenter={helpCenter}
                category={null}
                onClose={() => setOpen(false)}
            />
        </>
    )
}

describe('<HelpCenterCategory>', () => {
    it('renders in a hidden state by default', () => {
        const {getByTestId} = render(
            <HelpCenterCategory
                isOpen={false}
                isLoading={false}
                helpCenter={helpCenter}
                category={null}
                onClose={jest.fn()}
            />
        )

        expect(getByTestId('category-edit').className).toEqual('drawer closed')
    })

    it('appears when isOpen is true', () => {
        const {getByTestId} = render(<Example isOpen />)

        expect(getByTestId('category-edit').className).toEqual('drawer opened')
    })

    it('focuses the Title input when in view', () => {
        const {getByTestId} = render(<Example isOpen />)
        const titleInput = getByTestId('title-input')

        expect(document.activeElement).toEqual(titleInput)
    })

    describe('when the slug input is pristine', () => {
        it('autocomplete the Slug input when Title is changed', () => {
            const {getByTestId} = render(<Example isOpen />)

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
        it(`doesn't change the Slug input when Title is changed`, () => {
            const {getByTestId} = render(<Example isOpen />)

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

    // TODO: uncomment this when we support different languages
    // it('changes the language in the slug domain', () => {
    //     const {getByTestId} = render(<Example isOpen />)

    //     expect(getByTestId('slug-domain').textContent).toEqual(
    //         `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/en-us`
    //     )

    //     fireEvent.click(getByTestId('dropdown-select-trigger'))
    //     fireEvent.click(getByTestId('option-fr-FR'))

    //     expect(getByTestId('slug-domain').textContent).toEqual(
    //         `https://${helpCenter.subdomain}.${HELP_CENTER_DOMAIN}/fr-fr`
    //     )
    // })

    it('disables the Save button if Title, Slug or Description are missing', () => {
        const {getByLabelText, getByTestId} = render(<Example isOpen />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })
        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByLabelText('Description'), {
            target: {
                value: '   ',
            },
        })
        expect(button.disabled).toBeTruthy()

        fireEvent.change(getByLabelText('Description'), {
            target: {
                value: 'some description',
            },
        })
        expect(button.disabled).toBeFalsy()
    })

    it('resets the fields when isOpen changes to false', () => {
        const {getByTestId} = render(<Example isOpen />)
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
