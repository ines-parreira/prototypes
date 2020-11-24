import React from 'react'
import {
    fireEvent,
    render,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'

import ConfirmButton from '../ConfirmButton.tsx'

describe('<ConfirmButton />', () => {
    it('should match snapshot', () => {
        const {container} = render(<ConfirmButton id="1" />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show popover on click', () => {
        const {getByText} = render(<ConfirmButton id="1">Submit</ConfirmButton>)

        fireEvent.click(getByText('Submit'))

        expect(getByText(/are you sure/i)).toBeTruthy()
    })

    it('should hide popover on confirm', async () => {
        const {getByText} = render(<ConfirmButton id="1">Submit</ConfirmButton>)

        fireEvent.click(getByText('Submit'))
        fireEvent.click(getByText('Confirm'))
        await waitForElementToBeRemoved(() => getByText('Confirm'))
    })

    it('should submit form', () => {
        const submit = jest.fn()
        const {getByText} = render(
            <form onSubmit={submit}>
                <ConfirmButton id="1" type="submit" skip={true}>
                    Submit
                </ConfirmButton>
            </form>
        )

        fireEvent.click(getByText('Submit'))
        expect(submit).toBeCalled()
    })

    it('should have loading state', () => {
        const {container} = render(<ConfirmButton id="1" loading />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have loading state on confirm', () => {
        const confirm = () => new Promise((resolve) => setTimeout(resolve, 10))
        const {getByText} = render(
            <ConfirmButton id="1" confirm={confirm}>
                Submit
            </ConfirmButton>
        )
        fireEvent.click(getByText('Submit'))
        fireEvent.click(getByText('Confirm'))

        expect(
            getByText('Submit').getAttribute('class').includes('btn-loading')
        ).toBe(true)
    })

    it('should not have loading state on confirm done', async () => {
        const confirm = jest.fn()
        const {getByText} = render(
            <ConfirmButton id="1" confirm={confirm}>
                Submit
            </ConfirmButton>
        )
        const submitNode = getByText('Submit')
        fireEvent.click(submitNode)
        fireEvent.click(getByText('Confirm'))

        expect(submitNode.getAttribute('class').includes('btn-loading')).toBe(
            true
        )

        await waitFor(() =>
            expect(
                submitNode.getAttribute('class').includes('btn-loading')
            ).toBe(false)
        )
    })
})
