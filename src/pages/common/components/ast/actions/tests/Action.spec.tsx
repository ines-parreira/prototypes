import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'

import React, {ComponentType} from 'react'

import Action from '../Action'

jest.mock('../ActionSelect', () => () => <div>ActionSelect</div>)

describe('Action', () => {
    describe('render()', () => {
        const MockedChild: ComponentType<{properties: any[]}> = () => <div />
        const minProps = {
            actions: {
                modifyCodeAST: jest.fn(),
                getCondition: jest.fn(),
            },
            depth: 2,
            children: <MockedChild properties={[]} />,
            parent: fromJS([]),
            properties: [
                {
                    key: {name: 'name'},
                    value: {value: ''},
                },
            ],
            rule: fromJS({}),
        }

        it.each(['facebookHideComment', 'facebookLikeComment'])(
            'should render a warning about potential page deactivation in Facebook',
            (actionValue) => {
                const props = {
                    ...minProps,
                    value: actionValue,
                }
                render(<Action {...props} />)

                expect(
                    screen.getByText(
                        'An extensive use of automatic Facebook actions may deactivate your page on Facebook!'
                    )
                ).toBeInTheDocument()
            }
        )

        it('should render an error saying an action cannot be empty', () => {
            render(<Action {...minProps} value="" />)

            expect(
                screen.getByText('An action cannot be empty')
            ).toBeInTheDocument()
        })

        it('should render a warning regarding team assignment', () => {
            render(<Action {...minProps} value="setTeamAssignee" />)

            expect(
                screen.getByText(/To set up team auto-assignment, go to the/)
            ).toBeInTheDocument()
        })

        it('should not render extra info when config is not found', () => {
            render(<Action {...minProps} value="nonExistingValue" />)

            expect(
                screen.queryByText('Tags cannot not be empty')
            ).not.toBeInTheDocument()
        })

        it('should not render error', () => {
            render(
                <Action
                    {...minProps}
                    value="setTags"
                    properties={[
                        {
                            key: {name: 'tags'},
                            value: {value: 'tag'},
                        },
                    ]}
                />
            )

            expect(
                screen.queryByText('Tags cannot not be empty')
            ).not.toBeInTheDocument()
        })

        it('should render single error', () => {
            render(
                <Action
                    {...minProps}
                    value="setTags"
                    properties={[
                        {
                            key: {name: 'tags'},
                            value: {value: ''},
                        },
                    ]}
                />
            )

            expect(screen.getByText('Tags cannot be empty')).toBeInTheDocument()
        })

        it('should render multiple errors', () => {
            render(
                <Action
                    {...minProps}
                    value="sendEmail"
                    properties={[
                        {
                            key: {name: 'title'},
                            value: {value: ''},
                        },
                    ]}
                />
            )

            expect(screen.getByText('Body must be filled')).toBeInTheDocument()
            expect(
                screen.getByText('Email must have at least one recipient')
            ).toBeInTheDocument()
        })
    })
})
