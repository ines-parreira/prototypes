import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TicketSubmitButtonsContainer} from '../TicketSubmitButtons.tsx'

jest.mock('lodash/sample', () => (array) => array[0])

describe('TicketSubmitButtons component', () => {
    it('empty ticket', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                ticket={fromJS({})}
                newMessage={fromJS({
                    _internal: {
                        loading: {
                            submitMessage: false,
                        },
                    },
                })}
                submit={() => null}
                canSendMessage={false}
                currentUserPreferences={fromJS({})}
                isHidingTips={false}
                submitSetting={() => {}}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
