import {shallow} from 'enzyme'

import React, {ComponentProps, ComponentType} from 'react'

import Action from '../Action'

describe('Action', () => {
    describe('render()', () => {
        const MockedChild: ComponentType<{properties: any[]}> = () => <div />
        const minProps = {
            parent: [],
            children: <MockedChild properties={[]} />,
        }

        it.each(['facebookHideComment', 'facebookLikeComment'])(
            'should render a warning about potential page deactivation in Facebook',
            (actionValue) => {
                const props = {
                    ...minProps,
                    value: actionValue,
                } as unknown as ComponentProps<typeof Action>
                const component = shallow(<Action {...props} />)

                expect(component).toMatchSnapshot()
            }
        )

        it('should render an error saying an action cannot be empty', () => {
            const props = Object.assign({}, minProps, {
                value: '',
            }) as unknown as ComponentProps<typeof Action>

            const component = shallow(<Action {...props} />)

            expect(component).toMatchSnapshot()
        })

        it('should render a warning regarding team assignment', () => {
            const props = {
                ...minProps,
                value: 'setTeamAssignee',
            } as unknown as ComponentProps<typeof Action>
            const component = shallow(<Action {...props} />)

            expect(component).toMatchSnapshot()
        })
    })
})
