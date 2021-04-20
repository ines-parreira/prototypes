import React from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {Magento2OneClickIntegrationForm} from '../Magento2OneClickIntegrationForm.tsx'

describe('<Magento2OneClickIntegrationForm/>', () => {
    const commonProps = {
        redirectUri: 'gorgias.io',
        actions: {
            activateIntegration: jest.fn(),
            deactivateIntegration: jest.fn(),
            deleteIntegration: jest.fn(),
        },
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
