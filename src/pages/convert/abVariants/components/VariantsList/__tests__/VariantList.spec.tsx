import React from 'react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'

import {campaignWithABGroup} from 'fixtures/abGroup'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {assumeMock, renderWithStore} from 'utils/testing'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {useGetTableStat} from 'pages/stats/convert/hooks/stats/useGetTableStat'

import VariantsList from '../VariantList'

jest.mock('pages/stats/convert/hooks/stats/useGetTableStat')
const useGetTableStatMock = assumeMock(useGetTableStat)

describe('<VariantsList />', () => {
    const onDelete = jest.fn()
    const onDuplicate = jest.fn()

    beforeAll(() => {
        useGetTableStatMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {},
        })
    })

    it('render and user can performa basic actions', () => {
        const campaign = {
            ...campaignWithABGroup,
            variants: [],
        } as Campaign

        const {getByText, getByTestId} = renderWithStore(
            <VariantsList
                integrationId={shopifyIntegration.id}
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            }
        )

        expect(getByText('Control Variant')).toBeInTheDocument()

        const deleteBtn = getByTestId('delete-icon-button')
        expect(deleteBtn).toBeAriaDisabled()

        const duplicateBtn = getByTestId('duplicate-icon-button')
        userEvent.click(duplicateBtn)

        expect(onDuplicate).toBeCalledWith(null)
    })

    it('render and list actions should be disabled', () => {
        const {getAllByTestId} = renderWithStore(
            <VariantsList
                integrationId={shopifyIntegration.id}
                canPerformActions={true}
                campaign={campaignWithABGroup as Campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            }
        )

        const deleteButtons = getAllByTestId('delete-icon-button')
        expect(deleteButtons).toHaveLength(3)

        deleteButtons.forEach((element, idx) => {
            // First element is 'control version'
            if (idx === 0) {
                expect(element).toBeAriaDisabled()
            } else {
                expect(element).toBeAriaEnabled()
            }
        })

        const duplicateButtons = getAllByTestId('duplicate-icon-button')
        expect(duplicateButtons).toHaveLength(3)

        duplicateButtons.forEach((element) => {
            expect(element).toBeAriaDisabled()
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

        const {getByText, queryAllByText} = renderWithStore(
            <VariantsList
                integrationId={shopifyIntegration.id}
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            }
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

        const {queryAllByText} = renderWithStore(
            <VariantsList
                integrationId={shopifyIntegration.id}
                canPerformActions={true}
                campaign={campaign}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            }
        )

        expect(queryAllByText('33%')).toHaveLength(3)
    })
})
