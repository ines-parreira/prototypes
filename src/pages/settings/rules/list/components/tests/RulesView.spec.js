import React from 'react'
import {shallow} from 'enzyme'

import RulesView from '../RulesView'

const commonProps = {
    actions: {
        rules: {
            fetchRules: jest.fn(),
        },
    },
    location: {
        query: {},
    },
}

describe('RulesView component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should put the ruleId in the openedRules array because a ruleId is passed', () => {
        const component = shallow(
            <RulesView
                {...commonProps}
                location={{
                    query: {
                        ruleId: '3',
                    },
                }}
            />
        )

        const openedRules = component.state('openedRules')
        expect(openedRules.includes(3)).toBe(true)
        expect(commonProps.actions.rules.fetchRules).toHaveBeenCalledWith()
        expect(commonProps.actions.rules.fetchRules).toHaveBeenCalledTimes(1)
    })

    it('should not put anything in the openedRules array because no ruleId is passed', () => {
        const component = shallow(<RulesView {...commonProps} />)

        const openedRules = component.state('openedRules')
        expect(openedRules).toEqual([])
        expect(commonProps.actions.rules.fetchRules).toHaveBeenCalledWith()
        expect(commonProps.actions.rules.fetchRules).toHaveBeenCalledTimes(1)
    })
})
