import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import CustomerInfoWrapper from '../CustomerInfoWrapper'

describe('CustomerInfoWrapper component', () => {
    it('should render child a and child b with the show more button because # of children is > 2', () => {
        const {container} = render(
            <CustomerInfoWrapper>
                <p key={0}>a</p>
                <p key={1}>b</p>
                <p key={2}>c</p>
                <p key={3}>d</p>
            </CustomerInfoWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render child a and no show more button because there is only one child', () => {
        const {container} = render(
            <CustomerInfoWrapper>
                <p key={0}>a</p>
            </CustomerInfoWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render child a and no show more button because there is only one defined child', () => {
        const {container} = render(
            <CustomerInfoWrapper>
                <p key={0}>a</p>
                {undefined}
                {null}
            </CustomerInfoWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render all 4 children and a Show Less button because the Show More button was clicked', () => {
        const {container, getByRole} = render(
            <CustomerInfoWrapper>
                <p key={0}>a</p>
                <p key={1}>b</p>
                <p key={2}>c</p>
                <p key={3}>d</p>
            </CustomerInfoWrapper>
        )

        fireEvent.click(getByRole('button'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should only 2 children and a Show More button because, the Show More button was clicked once, then all 4 children were rendered and the Less Info button was clicked', () => {
        const {container, getByRole} = render(
            <CustomerInfoWrapper>
                <p key={0}>a</p>
                <p key={1}>b</p>
                <p key={2}>c</p>
                <p key={3}>d</p>
            </CustomerInfoWrapper>
        )

        fireEvent.click(getByRole('button'))
        fireEvent.click(getByRole('button'))
        expect(container.firstChild).toMatchSnapshot()
    })
})
