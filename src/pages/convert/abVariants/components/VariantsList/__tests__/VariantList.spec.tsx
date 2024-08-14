import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {campaignWithABGroup} from 'fixtures/abGroup'

import VariantsList from '../VariantList'

jest.mock('hooks/useGetDateAndTimeFormat')

const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

describe('<VariantsList />', () => {
    const onDelete = jest.fn()
    const onDuplicate = jest.fn()

    it('render and user can performa basic actions', () => {
        const campaign = {
            ...campaignWithABGroup,
            variants: [],
        } as Campaign

        const {getByText, getByTestId} = render(
            <VariantsList
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        expect(getByText('Control Variant')).toBeInTheDocument()

        const deleteBtn = getByTestId('delete-icon-button')
        expect(deleteBtn).toHaveAttribute('aria-disabled', 'true')

        const duplicateBtn = getByTestId('duplicate-icon-button')
        userEvent.click(duplicateBtn)

        expect(onDuplicate).toBeCalledWith(null)
    })

    it('render and list actions should be disabled', () => {
        const {getAllByTestId} = render(
            <VariantsList
                canPerformActions={true}
                campaign={campaignWithABGroup as Campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        const deleteButtons = getAllByTestId('delete-icon-button')
        expect(deleteButtons).toHaveLength(3)

        deleteButtons.forEach((element, idx) => {
            // First element is 'control version'
            expect(element).toHaveAttribute(
                'aria-disabled',
                idx === 0 ? 'true' : 'false'
            )
        })

        const duplicateButtons = getAllByTestId('duplicate-icon-button')
        expect(duplicateButtons).toHaveLength(3)

        duplicateButtons.forEach((element) => {
            expect(element).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('render list with winner badge and correct traffic allocation when completed', () => {
        const campaign = {
            ...campaignWithABGroup,
            ab_group: {
                ...campaignWithABGroup.ab_group,
                winner_variant_id: campaignWithABGroup.variants[0].id,
                status: 'completed',
            },
        } as Campaign

        const {getByText, queryAllByText} = render(
            <VariantsList
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        expect(getByText('Winner')).toBeInTheDocument()
        expect(queryAllByText('33%')).toHaveLength(0)
    })

    it('render list with correct traffic allocation if test is started', () => {
        const campaign = {
            ...campaignWithABGroup,
            ab_group: {
                ...campaignWithABGroup.ab_group,
                status: 'started',
            },
        } as Campaign

        const {queryAllByText} = render(
            <VariantsList
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        )

        expect(queryAllByText('33%')).toHaveLength(3)
    })
})
