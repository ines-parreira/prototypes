import React, {ComponentProps} from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {Magento2OneClickIntegrationForm} from '../Magento2OneClickIntegrationForm'
import {Magento2IntegrationActionButtons} from '../Magento2IntegrationActionButtons'

jest.mock('../Magento2IntegrationActionButtons', () => {
    const {
        Magento2IntegrationActionButtons: Magento2IntegrationActionButtonsMock,
    } = jest.requireActual('../Magento2IntegrationActionButtons')
    return Magento2IntegrationActionButtonsMock as Partial<
        typeof Magento2IntegrationActionButtons
    >
})

describe('<Magento2OneClickIntegrationForm/>', () => {
    const minProps: ComponentProps<typeof Magento2OneClickIntegrationForm> = {
        integration: fromJS({}),
        isUpdate: false,
        isSubmitting: false,
        redirectUri: 'gorgias.io',
        updateOrCreateIntegration: jest.fn(),
        getExistingMagento2Integration: jest.fn().mockReturnValue(fromJS({})),
    }

    describe('render()', () => {
        it('should render the page to create a new one-click integration', () => {
            const {container} = render(
                <Magento2OneClickIntegrationForm {...minProps} />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
