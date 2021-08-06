import React from 'react'

import {render} from '@testing-library/react'

import {ConnectionStatus} from '../ConnectionStatus'

describe('<ConnectionStatus />', () => {
    it('matches snapshot with status unknown', () => {
        const {container} = render(
            <ConnectionStatus status="unknown" label="Error connecting" />
        )
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot with status active', () => {
        const {container} = render(
            <ConnectionStatus status="active" label="Connected" />
        )
        expect(container).toMatchSnapshot()
    })

    it('matches snapshot while loading', () => {
        const {container} = render(
            <ConnectionStatus status="pending" label="Connecting" />
        )
        expect(container).toMatchSnapshot()
    })

    it('renders the expected icon', () => {
        const {getByTestId, rerender} = render(
            <ConnectionStatus status="pending" label="Connecting" />
        )
        getByTestId('icon-loading')

        rerender(<ConnectionStatus status="active" label="Connected" />)
        getByTestId('icon-wifi')

        rerender(<ConnectionStatus status="unknown" label="Error connecting" />)
        getByTestId('icon-wifi_off')
    })
})
