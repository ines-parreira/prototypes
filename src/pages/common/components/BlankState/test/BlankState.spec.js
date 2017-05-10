import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {BlankState} from '../components/BlankState'

describe('BlankState component', () => {
    it('default with undefined props', () => {
        const component = shallow(
            <BlankState />
        )
        expect(component).toContainReact(<div className="blank-state"><div>This view is empty. Enjoy your day!</div></div>)
    })

    it('custom message', () => {
        const component = shallow(
            <BlankState
                message={<div>Custom message</div>}
            />
        )
        expect(component).toContainReact(<div className="blank-state"><div>Custom message</div></div>)
    })

    it('more than 10 tickets closed', () => {
        const component = shallow(
            <BlankState
                stats={fromJS({
                    agents: [['Alex', 11]]
                })}
            />
        )

        expect(component.find('.blank-state-message')).toIncludeText('No more tickets here!')
    })

    it('more than 100 tickets closed', () => {
        const component = shallow(
            <BlankState
                stats={fromJS({
                    agents: [['Alex', 101]]
                })}
            />
        )

        expect(component.find('.blank-state-message')).toIncludeText('Done!')
    })

    it('more than 500 tickets closed', () => {
        const component = shallow(
            <BlankState
                stats={fromJS({
                    agents: [['Alex', 501]]
                })}
            />
        )

        expect(component.find('.blank-state-message')).toIncludeText('All good!')
    })
})
