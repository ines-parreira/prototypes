import React from 'react'

import { act, render } from '@testing-library/react'

import { campaignWithABGroup, variants } from 'fixtures/abGroup'
import { userEvent } from 'utils/testing/userEvent'

import StopABTestModal from '../StopABTestModal'

describe('<StopABTestModal />', () => {
    const onClose = jest.fn()
    const onSubmit = jest.fn()

    it('renders', () => {
        const { getByText } = render(
            <StopABTestModal
                isOpen={true}
                variants={variants}
                controlVersionId={campaignWithABGroup.id}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )

        expect(getByText('Stop A/B test')).toBeInTheDocument()
        expect(getByText('Control Variant')).toBeInTheDocument()
        expect(getByText('Variant A')).toBeInTheDocument()
    })

    it('user selected `control variant`', () => {
        const { getByText, getByRole } = render(
            <StopABTestModal
                isOpen={true}
                variants={variants}
                controlVersionId={campaignWithABGroup.id}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )

        act(() => {
            userEvent.click(getByText('Control Variant'))
        })

        userEvent.click(getByRole('button', { name: 'Stop Test' }))

        expect(onSubmit).toBeCalledTimes(1)
        expect(onSubmit).toBeCalledWith(null)
    })

    it('user selected variant', () => {
        const { getByText, getByRole } = render(
            <StopABTestModal
                isOpen={true}
                variants={variants}
                controlVersionId={campaignWithABGroup.id}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        )

        act(() => {
            userEvent.click(getByText('Variant A'))
        })

        userEvent.click(getByRole('button', { name: 'Stop Test' }))

        expect(onSubmit).toBeCalledTimes(1)
        expect(onSubmit).toBeCalledWith(variants[0].id)
    })
})
