import React from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {Magento2ManualIntegrationForm} from '../Magento2ManualIntegrationForm'
import {Magento2IntegrationActionButtons} from '../Magento2IntegrationActionButtons'

jest.mock('../Magento2IntegrationActionButtons', () => {
    const {
        Magento2IntegrationActionButtons: Magento2IntegrationActionButtonsMock,
    } = jest.requireActual('../Magento2IntegrationActionButtons')
    return Magento2IntegrationActionButtonsMock as Partial<
        typeof Magento2IntegrationActionButtons
    >
})

describe('<Magento2ManualIntegrationForm/>', () => {
    describe('render()', () => {
        it('should render the page to create a new manual integration', () => {
            const {container} = render(
                <Magento2ManualIntegrationForm
                    isSubmitting={false}
                    integration={fromJS({})}
                    isUpdate={false}
                    updateOrCreateIntegration={jest.fn()}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
