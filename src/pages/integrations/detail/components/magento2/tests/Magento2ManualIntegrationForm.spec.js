import React from 'react'

import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import Magento2ManualIntegrationForm from '../Magento2ManualIntegrationForm.tsx'

describe('<Magento2ManualIntegrationForm/>', () => {
    const commonProps = {
        actions: {
            activateIntegration: jest.fn(),
            deactivateIntegration: jest.fn(),
            deleteIntegration: jest.fn(),
        },
    }

    describe('render()', () => {
        it('should render the page to create a new manual integration', () => {
            const {container} = render(
                <Magento2ManualIntegrationForm
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
