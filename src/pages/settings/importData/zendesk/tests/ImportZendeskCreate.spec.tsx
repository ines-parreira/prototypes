import React from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'

import {fromJS, List, Map} from 'immutable'

import {ImportZendeskCreate} from '../ImportZendeskCreate'
import {StoreDispatch} from '../../../../../state/types'
import {IntegrationType} from '../../../../../models/integration/types'
import {ZENDESK_CONNECTION_TYPE} from '../types'

interface ImportZendeskCreateProps {
    integrations: List<Map<any, any>>
    createIntegration(
        integration: Map<any, any>
    ): (dispatch: StoreDispatch) => Promise<unknown>
}
const renderComponent = (props: ImportZendeskCreateProps): RenderResult => {
    return render(<ImportZendeskCreate {...props} />)
}

describe('<ImportZendeskCreate/>', () => {
    const mockedCreateIntegration = jest.fn()
    const defaultProps = {
        integrations: fromJS([{name: 'acme'}]),
        createIntegration: mockedCreateIntegration,
    }

    describe('rendering', () => {
        it('without any errors and disabled creation button', () => {
            const {getByText} = renderComponent(defaultProps)
            expect(
                (
                    getByText('Start import').closest(
                        'button'
                    ) as HTMLButtonElement
                ).disabled
            ).toEqual(true)
        })

        it('with error because domain already exists', () => {
            const {getByLabelText, getByText} = renderComponent(defaultProps)
            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: {value: 'acme'},
            })

            expect(getByText('This domain was already imported.')).toBeDefined()
            expect(
                (
                    getByText('Start import').closest(
                        'button'
                    ) as HTMLButtonElement
                ).disabled
            ).toEqual(true)
        })

        it('submit the form to create integration', () => {
            const {getByLabelText, getByText, container} =
                renderComponent(defaultProps)
            const domain = 'gorgias'
            const apiKey = '123456'
            const email = 'gorgias+test@gorgias.com'

            const mockDate = new Date().toISOString()
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
            Date.prototype.toISOString = () => mockDate
            Date.now = () => new Date(mockDate).valueOf()

            fireEvent.change(getByLabelText('Zendesk subdomain'), {
                target: {value: 'gorgias'},
            })
            fireEvent.change(getByLabelText('Login email'), {
                target: {value: 'gorgias+test@gorgias.com'},
            })

            fireEvent.change(container.querySelector('#id-apiKey') as Element, {
                target: {value: '123456'},
            })

            expect(
                (
                    getByText('Start import').closest(
                        'button'
                    ) as HTMLButtonElement
                ).disabled
            ).toEqual(false)

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
                })
            )
        })
    })
})
