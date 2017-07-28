import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../store/configureStore'
import TicketSubmitButtons from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array) => array[0])

describe('TicketSubmitButtons component', () => {
    it('empty ticket', () => {
        const component = shallow(
            <TicketSubmitButtons
                store={configureStore()}
                ticket={fromJS({})}
                submit={() => null}
            />
        ).find('TicketSubmitButtons').dive() // dive in connect()ed component
        expect(component).toMatchSnapshot()
    })
})
