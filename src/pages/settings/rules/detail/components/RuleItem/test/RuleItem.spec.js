import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import RuleItem from '../RuleItem'
import {getMomentUtcISOString} from '../../../../../../../utils/date'


const commonProps = {
    rule: fromJS({
        id: 17,
        title: 'my rule',
        code_ast: {},
        code: {}
    }),
    actions: {
        rules: {
            modifyCodeAst: jest.fn(),
            create: jest.fn(() => Promise.resolve({rule: {id: 12}})),
            reset: jest.fn(() => Promise.resolve())
        }
    },
    toggleOpening: jest.fn()
}

describe('RuleItem component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = shallow(
            <RuleItem
                {...commonProps}
            />
        ).setState({
            eventTypes: ['ticket-updated']
        })

        expect(component).toMatchSnapshot()
    })

    it('should render errors when there is no trigger selected', () => {
        const component = shallow(
            <RuleItem
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    describe('saveAsNewRule', () => {
        it('should create a new rule, close the current one and open the new one when clicking "save as new rule"', () => {
            const toggleOpeningSpy = jest.fn()
            const description = 'foo'
            const eventTypes = ['ticket-updated']
            const component = shallow(
                <RuleItem
                    {...commonProps}
                    toggleOpening={toggleOpeningSpy}
                />
            ).setState({
                description,
                eventTypes,
                title: commonProps.rule.get('title')
            })

            const instance = component.instance()
            instance._saveAsNewRule().then(() => {
                expect(commonProps.actions.rules.create).toHaveBeenCalledWith({
                    description,
                    event_types: eventTypes.join(','),
                    title: `${commonProps.rule.get('title')} - copy`,
                    code: commonProps.rule.get('code'),
                    code_ast: commonProps.rule.get('code_ast'),
                    deactivated_datetime: getMomentUtcISOString()
                })
                expect(toggleOpeningSpy).toHaveBeenCalledWith(17) // old rule
                expect(toggleOpeningSpy).toHaveBeenCalledWith(12) // new rule
            })
        })

        it('should not add `- copy` at the end of the title of the new rule, when it is not the same as the title of the old rule', () => {
            const toggleOpeningSpy = jest.fn()
            const description = 'foo'
            const eventTypes = ['ticket-updated']
            const title = 'WAYOU'
            const component = shallow(
                <RuleItem
                    {...commonProps}
                    toggleOpening={toggleOpeningSpy}
                />
            ).setState({
                description,
                eventTypes,
                title
            })

            const instance = component.instance()
            instance._saveAsNewRule().then(() => {
                expect(commonProps.actions.rules.create).toHaveBeenCalledWith({
                    description,
                    event_types: eventTypes.join(','),
                    title,
                    code: commonProps.rule.get('code'),
                    code_ast: commonProps.rule.get('code_ast'),
                    deactivated_datetime: getMomentUtcISOString()
                })
                expect(toggleOpeningSpy).toHaveBeenCalledWith(17) // old rule
                expect(toggleOpeningSpy).toHaveBeenCalledWith(12) // new rule
            })
        })
    })
})
