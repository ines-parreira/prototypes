import React from 'react'

import { fireEvent, RenderResult, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import { renderWithRouter } from 'utils/testing'

import {
    IntegrationType,
    ZendeskIntegration,
} from '../../../../../models/integration/types'
import { StoreDispatch } from '../../../../../state/types'
import { ImportZendeskCreate } from '../ImportZendeskCreate'
import { ZENDESK_CONNECTION_TYPE } from '../types'
import { failedImport, pendingImport, successImport } from './fixtures'

interface ImportZendeskCreateProps {
    integrations: ZendeskIntegration[]
    createIntegration(
        integration: Map<any, any>,
    ): (dispatch: StoreDispatch) => Promise<unknown>
}
const renderComponent = (props: ImportZendeskCreateProps): RenderResult => {
    return renderWithRouter(<ImportZendeskCreate {...props} />)
}

describe('<ImportZendeskCreate/>', () => {
    const mockedCreateIntegration = jest.fn()
    const integrations = [successImport, pendingImport, failedImport]
    integrations[0].name = 'acme'
    const defaultProps = {
        integrations,
        createIntegration: mockedCreateIntegration,
    }

    describe('rendering', () => {
        it('without any errors and disabled creation button', () => {
            renderComponent(defaultProps)
            expect(
                screen.getByRole('button', { name: /Start import/ }),
            ).toBeAriaDisabled()
        })

        it('with error because domain already exists', () => {
            const { getByLabelText, getByText } = renderComponent(defaultProps)
            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: { value: 'acme' },
            })

            expect(getByText('This domain was already imported.')).toBeDefined()
            expect(
                screen.getByRole('button', { name: /Start import/ }),
            ).toBeAriaDisabled()
        })

        it('submit the form to create integration', () => {
            const { getByLabelText, getByText, container } =
                renderComponent(defaultProps)
            const domain = 'gorgias'
            const apiKey = '123456'
            const email = 'gorgias+test@gorgias.com'

            const mockDate = new Date().toISOString()
            jest.spyOn(global, 'Date').mockImplementation(
                () => mockDate as unknown as Date,
            )
            Date.prototype.toISOString = () => mockDate
            Date.now = () => new Date(mockDate).valueOf()

            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: { value: 'gorgias' },
            })
            fireEvent.change(getByLabelText('Login email'), {
                target: { value: 'gorgias+test@gorgias.com' },
            })

            fireEvent.change(container.querySelector('#id-apiKey') as Element, {
                target: { value: '123456' },
            })

            expect(
                screen.getByRole('button', { name: /Start import/ }),
            ).toBeAriaEnabled()

            fireEvent.click(getByText('Start import'))
            expect(mockedCreateIntegration).toBeCalledWith(
                fromJS({
                    name: domain,
                    type: IntegrationType.Zendesk,
                    connections: [
                        {
                            type: ZENDESK_CONNECTION_TYPE,
                            data: {
                                domain: domain,
                                email: email,
                                api_key: apiKey,
                            },
                        },
                    ],
                    deactivated_datetime: mockDate,
                }),
            )
        })
    })
})
