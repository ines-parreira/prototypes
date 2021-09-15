import React from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {Magento2OneClickIntegrationForm} from '../Magento2OneClickIntegrationForm.tsx'

jest.mock('../Magento2IntegrationActionButtons', () => {
    const {Magento2IntegrationActionButtons} = jest.requireActual(
        '../Magento2IntegrationActionButtons'
    )

    return Magento2IntegrationActionButtons
})

describe('<Magento2OneClickIntegrationForm/>', () => {
    const commonProps = {
        redirectUri: 'gorgias.io',
        updateOrCreateIntegration: jest.fn(),
        getExistingMagento2Integration: jest.fn().mockReturnValue(fromJS({})),
    }

    describe('render()', () => {
        it('should render the page to create a new one-click integration', () => {
            const {container} = render(
                <Magento2OneClickIntegrationForm
                    isSubmitting={false}
                    submitIsDisabled={false}
                    integration={fromJS({})}
                    isUpdate={false}
                    {...commonProps}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
