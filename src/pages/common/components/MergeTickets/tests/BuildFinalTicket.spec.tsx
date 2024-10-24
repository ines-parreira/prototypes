import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import _noop from 'lodash/noop'
import React from 'react'

import BuildFinalTicket from '../BuildFinalTicket'

describe('BuildFinalTicket component', () => {
    const baseTicket = fromJS({
        subject: 'foo',
        assignee_user: {
            id: 1,
            name: 'John Smith',
        },
        customer: {
            id: 22,
            name: 'Maria Curie',
        },
    }) as Map<any, any>
    const updateFinalTicket = _noop

    it('should not display any fields because they are all identical', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the subject field because the subjects on the tickets are different', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket.set('subject', 'bar')}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the customer field because the customers on the tickets are different', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket.set(
                    'customer',
                    fromJS({
                        id: 33,
                        name: 'Pedro Curie',
                    })
                )}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the assignee field because the assignees on the tickets are different', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket.set(
                    'assignee_user',
                    fromJS({
                        id: 2,
                        name: 'Jack Ryan',
                    })
                )}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display the assignee field because one of the assignees is empty', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket.set('assignee_user', fromJS({}))}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display all fields because everything is different', () => {
        const {container} = render(
            <BuildFinalTicket
                sourceTicket={baseTicket}
                targetTicket={baseTicket
                    .set('subject', 'bar')
                    .set(
                        'assignee_user',
                        fromJS({
                            id: 2,
                            name: 'Jack Ryan',
                        })
                    )
                    .set(
                        'customer',
                        fromJS({
                            id: 33,
                            name: 'Pedro Curie',
                        })
                    )}
                finalTicket={baseTicket}
                updateFinalTicket={updateFinalTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
