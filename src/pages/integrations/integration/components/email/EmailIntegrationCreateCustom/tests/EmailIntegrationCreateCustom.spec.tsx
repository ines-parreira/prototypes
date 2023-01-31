import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {EmailIntegrationCreateCustom} from '../EmailIntegrationCreateCustom'

const commonProps: ComponentProps<typeof EmailIntegrationCreateCustom> = {
    domain: 'test',
    loading: fromJS({updateIntegration: false}),
    notify: jest.fn(),
    updateOrCreateIntegration: jest.fn(),
}

describe('<EmailIntegrationCreateCustom/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <EmailIntegrationCreateCustom {...commonProps} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render update', () => {
            const {container} = render(
                <EmailIntegrationCreateCustom
                    {...commonProps}
                    loading={fromJS({updateIntegration: true})}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
