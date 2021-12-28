import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {WidgetContext} from '../../WidgetContext'
import {ActionButtonContext} from '../ActionButton'
import {IntegrationContext} from '../IntegrationContext'
import {EditableListWidget} from '../EditableListWidget'

const executeAction = jest.fn()

const minProps = {
    selectedOptions: '',
    activeCustomerId: 1,
    widgetIsEditing: false,
    currentAccount: fromJS({}),
    executeAction: executeAction,
}

const widgetContextValue = {
    data_source: 'customer',
    widget_resource_ids: {
        target_id: null,
        customer_id: null,
    },
}
const integrationContextValue = {integration: fromJS({}), integrationId: 1}
const actionButtonContextValue = {actionError: ''}

describe('<EditableListWidget/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render an empty list because no options has been given', () => {
        const {container} = render(
            <WidgetContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ActionButtonContext.Provider
                        value={actionButtonContextValue}
                    >
                        <EditableListWidget {...minProps} />
                    </ActionButtonContext.Provider>
                </IntegrationContext.Provider>
            </WidgetContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a list with some tags in it', () => {
        minProps.selectedOptions = 'cool, super'
        const {container} = render(
            <WidgetContext.Provider value={widgetContextValue}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ActionButtonContext.Provider
                        value={actionButtonContextValue}
                    >
                        <EditableListWidget {...minProps} />
                    </ActionButtonContext.Provider>
                </IntegrationContext.Provider>
            </WidgetContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
