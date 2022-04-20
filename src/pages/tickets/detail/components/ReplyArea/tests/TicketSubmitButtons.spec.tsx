import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TicketSubmitButtonsContainer} from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array: unknown[]) => array[0])

describe('TicketSubmitButtons component', () => {
    it('empty ticket', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                submit={() => null}
                ticket={fromJS({})}
                canSendMessage={false}
                currentUserPreferences={fromJS({})}
                isHidingTips={false}
                newMessage={fromJS({
                    _internal: {
                        loading: {
                            submitMessage: false,
                        },
                    },
                })}
                submitSetting={jest.fn()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
