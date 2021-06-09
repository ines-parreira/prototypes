import PropTypes from 'prop-types'
import React, {ReactNode, Component} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {ActionButtonContext} from '../ActionButton'
import {EditableListWidget} from '../EditableListWidget'

interface IWidgetRessources {
    target_id: number
    customer_id?: number
}

class MockLegacyContextWrapper extends Component<{
    children: ReactNode
    value?: {
        integrationId?: number
        data_source?: string
        widget_resource_ids?: IWidgetRessources
    }
}> {
    static childContextTypes = {
        integrationId: PropTypes.number.isRequired,
        data_source: PropTypes.string.isRequired,
        widget_resource_ids: PropTypes.object.isRequired,
    }

    static defaultProps = {value: {}}

    getChildContext() {
        const {value} = this.props

        return {
            integrationId: 1,
            data_source: 'customer',
            widget_resource_ids: {},
            ...value,
        }
    }

    render() {
        const {children} = this.props
        return children
    }
}

const executeAction = jest.fn()

const minProps = {
    selectedOptions: '',
    activeCustomerId: 1,
    widgetIsEditing: false,
    currentAccount: fromJS({}),
    executeAction: executeAction,
}

describe('<EditableListWidget/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render an empty list because no options has been given', () => {
        const {container} = render(
            <ActionButtonContext.Provider value={{actionError: ''}}>
                <MockLegacyContextWrapper>
                    <EditableListWidget {...minProps} />
                </MockLegacyContextWrapper>
            </ActionButtonContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a list with some tags in it', () => {
        minProps.selectedOptions = 'cool, super'
        const {container} = render(
            <ActionButtonContext.Provider value={{actionError: ''}}>
                <MockLegacyContextWrapper>
                    <EditableListWidget {...minProps} />
                </MockLegacyContextWrapper>
            </ActionButtonContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
