import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import type { StoreIntegration } from 'models/integration/types'
import type { WorkflowConfigurationShallow } from 'pages/automate/workflows/models/workflowConfiguration.types'

import WorkflowRow, { getLink } from '../WorkflowRow'

describe('<WorkflowsRow />', () => {
    const duplicateFunction = jest.fn()
    const notifyMerchant = jest.fn()
    const shop1 = 'ShopName'
    const shop2 = 'ShopName1'
    const sortedIntegrations = [
        {
            id: 1,
            name: shop1,
            meta: { shop_name: shop1 },
            type: IntegrationType.Shopify,
        },
        {
            id: 2,
            name: shop2,
            meta: { shop_name: shop2 },
            type: IntegrationType.Shopify,
        },
    ] as unknown as StoreIntegration[]
    const comp = (
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
    )
    it('Should render rows accordingly', async () => {
        render(comp)
        // SHould render row
        await screen.findByText('Workflow 1')
    })
    it('Click on duplicate render dropdown', async () => {
        const { getByTitle } = render(comp)
        fireEvent.click(getByTitle('Duplicate flow'))
        await screen.findByText('DUPLICATE TO')
        await screen.findByText(`${shop1} (current store)`)
        await screen.findByText(shop2)
    })
    it('should render a draft badge if workflow is draft', async () => {
        render(
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
            />,
            {
                storeState: {},
            },
        )
        await screen.findByText('draft')
    })
    it('Create duplicate for current store', async () => {
        const { getByText, getByTitle } = render(comp)
        fireEvent.click(getByTitle('Duplicate flow'))
        fireEvent.click(getByText(`${shop1} (current store)`))
        await waitFor(() => {
            expect(duplicateFunction).toHaveBeenCalledWith('Workflow 1', 1)
        })
        expect(notifyMerchant).toHaveBeenCalledWith(
            'Successfully duplicated',
            'success',
        )
    })
    it('Create duplicate for different store', async () => {
        const { getByText, getByTitle } = render(comp)
        fireEvent.click(getByTitle('Duplicate flow'))
        fireEvent.click(getByText(shop2))
        await waitFor(() => {
            expect(duplicateFunction).toHaveBeenCalledWith('Workflow 1', 2)
        })
        expect(notifyMerchant).toHaveBeenCalledWith(
            getLink(sortedIntegrations[1]),
            'success',
        )
    })
})
