import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TagsSelectContainer} from '../TagsSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('TagsSelect', () => {
            const commonProps = {
                tags: fromJS([
                    {
                        name: 'billing',
                    },
                    {
                        name: 'refund',
                    },
                    {
                        name: 'question',
                    },
                ]),
                actions: {create: jest.fn()},
                onChange: jest.fn(),
            }

            beforeEach(() => {
                jest.clearAllMocks()
            })

            describe('MultiSelectField', () => {
                it('should render array as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            {...((commonProps as unknown) as ComponentProps<
                                typeof TagsSelectContainer
                            >)}
                            value={['billing', 'bugs']}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render string as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            {...((commonProps as unknown) as ComponentProps<
                                typeof TagsSelectContainer
                            >)}
                            value={'billing, bugs'}
                            multiple={true}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should handle change (array as value)', () => {
                    const component = shallow<TagsSelectContainer>(
                        <TagsSelectContainer
                            {...((commonProps as unknown) as ComponentProps<
                                typeof TagsSelectContainer
                            >)}
                            value={['billing', 'bugs']}
                            multiple={true}
                        />
                    ).instance()

                    component._onChange(['new', 'value'])
                    expect(commonProps.onChange.mock.calls[0]).toEqual([
                        ['new', 'value'],
                    ])
                })

                it('should handle change (string as value)', () => {
                    const component = shallow<TagsSelectContainer>(
                        <TagsSelectContainer
                            {...((commonProps as unknown) as ComponentProps<
                                typeof TagsSelectContainer
                            >)}
                            value={'billing, bugs'}
                            multiple={true}
                        />
                    ).instance()

                    component._onChange(['new', 'value'])
                    expect(commonProps.onChange.mock.calls[0]).toEqual([
                        'new,value',
                    ])
                })
            })

            it('should render a SelectField', () => {
                const component = shallow(
                    <TagsSelectContainer
                        {...((commonProps as unknown) as ComponentProps<
                            typeof TagsSelectContainer
                        >)}
                        value={'billing'}
                    />
                )
                expect(component).toMatchSnapshot()
            })

            it('should handle change', () => {
                const component = shallow<TagsSelectContainer>(
                    <TagsSelectContainer
                        {...((commonProps as unknown) as ComponentProps<
                            typeof TagsSelectContainer
                        >)}
                        value={'billing'}
                        multiple={false}
                    />
                ).instance()

                component._onChange(['new'])
                expect(commonProps.onChange.mock.calls[0]).toEqual([['new']])
            })
        })
    })
})
