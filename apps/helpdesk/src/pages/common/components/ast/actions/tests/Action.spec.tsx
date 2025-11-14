import { ComponentType } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { ActionType } from 'models/rule/types'

import Action from '../Action'

jest.mock('../ActionSelect', () => () => <div>ActionSelect</div>)

describe('Action', () => {
    describe('render()', () => {
        const MockedChild: ComponentType<{ properties: any[] }> = () => <div />
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
                    key: { name: 'name' },
                    value: { value: '' },
                },
            ],
            rule: fromJS({}),
        }

        it.each([
            'facebookHideComment' as ActionType,
            'facebookLikeComment' as ActionType,
        ])(
            'should render a warning about potential page deactivation in Facebook',
            (actionValue) => {
                const props = {
                    ...minProps,
                    value: actionValue,
                }
                render(
                    <MemoryRouter>
                        <Action {...props} />
                    </MemoryRouter>,
                )

                expect(
                    screen.getByText(
                        'An extensive use of automatic Facebook actions may deactivate your page on Facebook!',
                    ),
                ).toBeInTheDocument()
            },
        )

        it('should render an error saying an action cannot be empty', () => {
            render(
                <MemoryRouter>
                    <Action {...minProps} value="" />
                </MemoryRouter>,
            )

            expect(
                screen.getByText('An action cannot be empty'),
            ).toBeInTheDocument()
        })

        it('should render a warning regarding team assignment', () => {
            render(
                <MemoryRouter>
                    <Action {...minProps} value="setTeamAssignee" />
                </MemoryRouter>,
            )

            expect(
                screen.getByText(/To set up team auto-assignment, go to the/),
            ).toBeInTheDocument()
        })

        it('should not render error', () => {
            render(
                <MemoryRouter>
                    <Action
                        {...minProps}
                        value="setTags"
                        properties={[
                            {
                                key: { name: 'tags' },
                                value: { value: 'tag' },
                            },
                        ]}
                    />
                </MemoryRouter>,
            )

            expect(
                screen.queryByText('Tags cannot not be empty'),
            ).not.toBeInTheDocument()
        })

        it('should render single error', () => {
            render(
                <MemoryRouter>
                    <Action
                        {...minProps}
                        value="setTags"
                        properties={[
                            {
                                key: { name: 'tags' },
                                value: { value: '' },
                            },
                        ]}
                    />
                </MemoryRouter>,
            )

            expect(screen.getByText('Tags cannot be empty')).toBeInTheDocument()
        })

        it('should render multiple errors', () => {
            render(
                <MemoryRouter>
                    {' '}
                    <Action
                        {...minProps}
                        value="sendEmail"
                        properties={[
                            {
                                key: { name: 'title' },
                                value: { value: '' },
                            },
                        ]}
                    />{' '}
                </MemoryRouter>,
            )

            expect(screen.getByText('Body must be filled')).toBeInTheDocument()
            expect(
                screen.getByText('Email must have at least one recipient'),
            ).toBeInTheDocument()
        })

        it('should render a warning about reply to ticket action', () => {
            render(
                <MemoryRouter>
                    <Action {...minProps} value="replyToTicket" />
                </MemoryRouter>,
            )
            expect(screen.getByText('warning')).toBeInTheDocument()
        })
    })
})
