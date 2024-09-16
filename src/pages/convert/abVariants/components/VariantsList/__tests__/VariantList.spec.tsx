import React from 'react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'

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

        renderWithStore(
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

        expect(screen.getByText('Control Variant')).toBeInTheDocument()

        const deleteBtn = screen.getByLabelText('Delete campaign')
        expect(deleteBtn).toBeAriaDisabled()

        const duplicateBtn = screen.getByLabelText('Duplicate variant')
        userEvent.click(duplicateBtn)

        expect(onDuplicate).toBeCalledWith(null)
    })

    it('render and list actions should be disabled', () => {
        renderWithStore(
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

        const deleteButtons = screen.getAllByLabelText('Delete campaign')
        expect(deleteButtons).toHaveLength(3)

        deleteButtons.forEach((element, idx) => {
            // First element is 'control version'
            if (idx === 0) {
                expect(element).toBeAriaDisabled()
            } else {
                expect(element).toBeAriaEnabled()
            }
        })

        const duplicateButtons = screen.getAllByLabelText('Duplicate variant')
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

        renderWithStore(
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

        expect(screen.getByText('Winner')).toBeInTheDocument()
        expect(screen.queryAllByText('33%')).toHaveLength(0)
    })

    it('render list with correct traffic allocation if test is started', () => {
        const campaign = {
            ...campaignWithABGroup,
            ab_group: {
                ...campaignWithABGroup.ab_group,
                status: 'started',
            },
        } as Campaign

        renderWithStore(
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

        expect(screen.queryAllByText('33%')).toHaveLength(3)
    })
})
