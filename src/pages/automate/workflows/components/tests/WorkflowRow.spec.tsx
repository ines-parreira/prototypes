import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouterAndDnD} from 'utils/testing'
import {IntegrationType} from 'models/integration/constants'
import {StoreIntegration} from 'models/integration/types'

import {WorkflowConfigurationShallow} from '../../models/workflowConfiguration.types'
import WorkflowRow, {getLink} from '../WorkflowRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<WorkflowsRow />', () => {
    const duplicateFunction = jest.fn()
    const notifyMerchant = jest.fn()

    const shop1 = 'ShopName'
    const shop2 = 'ShopName1'

    const sortedIntegrations = [
        {
            id: 1,
            name: shop1,
            meta: {shop_name: shop1},
            type: IntegrationType.Shopify,
        },
        {
            id: 2,
            name: shop2,
            meta: {shop_name: shop2},
            type: IntegrationType.Shopify,
        },
    ] as unknown as StoreIntegration[]
    const comp = (
        <Provider store={mockStore()}>
            <WorkflowRow
                goToEditWorkflowPage={jest.fn()}
                onDuplicate={duplicateFunction}
                onDelete={jest.fn()}
                notifyMerchant={notifyMerchant}
                workflow={
                    {
                        id: 'Workflow 1',
                        name: 'Workflow 1',
                        available_languages: ['en-US'],
                        updated_datetime: '2023-12-22T09:57:21.303Z',
                        is_draft: false,
                    } as WorkflowConfigurationShallow
                }
                isUpdatePending={false}
                storeIntegrations={sortedIntegrations}
                storeIntegrationId={1}
            />
        </Provider>
    )
    it('Should render rows accordingly', async () => {
        renderWithRouterAndDnD(comp)
        // SHould render row
        await screen.findByText('Workflow 1')
    })
    it('Click on duplicate render dropdown', async () => {
        const {getByTitle} = renderWithRouterAndDnD(comp)

        fireEvent.click(getByTitle('Duplicate flow'))
        await screen.findByText('DUPLICATE TO')
        await screen.findByText(`${shop1} (current store)`)
        await screen.findByText(shop2)
    })

    it('should render a draft badge if workflow is draft', async () => {
        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <WorkflowRow
                    goToEditWorkflowPage={jest.fn()}
                    onDuplicate={duplicateFunction}
                    onDelete={jest.fn()}
                    notifyMerchant={notifyMerchant}
                    workflow={
                        {
                            id: 'Workflow 1',
                            name: 'Workflow 1',
                            available_languages: ['en-US'],
                            updated_datetime: '2023-12-22T09:57:21.303Z',
                            is_draft: true,
                        } as WorkflowConfigurationShallow
                    }
                    isUpdatePending={false}
                    storeIntegrations={sortedIntegrations}
                    storeIntegrationId={1}
                />
            </Provider>
        )
        await screen.findByText('draft')
    })

    it('Create duplicate for current store', async () => {
        const {getByText, getByTitle} = renderWithRouterAndDnD(comp)

        fireEvent.click(getByTitle('Duplicate flow'))
        fireEvent.click(getByText(`${shop1} (current store)`))
        await waitFor(() => {
            expect(duplicateFunction).toHaveBeenCalledWith('Workflow 1', 1)
        })

        expect(notifyMerchant).toHaveBeenCalledWith(
            'Successfully duplicated',
            'success'
        )
    })
    it('Create duplicate for different store', async () => {
        const {getByText, getByTitle} = renderWithRouterAndDnD(comp)

        fireEvent.click(getByTitle('Duplicate flow'))
        fireEvent.click(getByText(shop2))
        await waitFor(() => {
            expect(duplicateFunction).toHaveBeenCalledWith('Workflow 1', 2)
        })
        expect(notifyMerchant).toHaveBeenCalledWith(
            getLink(sortedIntegrations[1]),
            'success'
        )
    })
})
