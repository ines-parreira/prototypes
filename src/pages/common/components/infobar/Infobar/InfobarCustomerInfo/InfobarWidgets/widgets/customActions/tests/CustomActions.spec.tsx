import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import CustomActions from '../index'

const mockStore = configureMockStore([thunk])

describe('<ActionButtons/>', () => {
    const template = fromJS({
        templatePath: 'templatePath',
        templateAbsolutePath: 'templateAbsolutePath',
        meta: {
            custom: {
                links: [
                    {label: 'link - I am in snapshots', url: 'heaven'},
                    {
                        label: 'the object above is a link to heaven',
                        url: 'over the rainbow',
                    },
                ],
                buttons: [
                    {label: 'button - I am in snapshots'},
                    {label: 'button - I am in snapshots too'},
                ],
            },
        },
    })
    const source = fromJS({})

    it('should render links and buttons ', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <CustomActions
                    template={template}
                    source={source}
                    isEditing={false}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render links and buttons in edition mode', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <CustomActions template={template} source={source} isEditing />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
