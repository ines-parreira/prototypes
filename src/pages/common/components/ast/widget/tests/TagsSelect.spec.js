import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TagsSelectContainer} from '../TagsSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('TagsSelect', () => {
            const tags = fromJS([
                {
                    name: 'billing',
                },
                {
                    name: 'refund',
                },
                {
                    name: 'question',
                },
            ])
            const actions = {
                create: jest.fn(),
            }

            describe('MultiSelectField', () => {
                it('should render array as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            tags={tags}
                            value={['billing', 'bugs']}
                            onChange={jest.fn()}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render string as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            tags={tags}
                            value={'billing, bugs'}
                            multiple={true}
                            onChange={jest.fn()}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should handle change (array as value)', () => {
                    const onChangeSpy = jest.fn()
                    const component = shallow(
                        <TagsSelectContainer
                            tags={tags}
                            value={['billing', 'bugs']}
                            multiple={true}
                            onChange={onChangeSpy}
                            actions={actions}
                        />
                    ).instance()

                    component._onChange(['new', 'value'])
                    expect(onChangeSpy.mock.calls[0]).toEqual([
                        ['new', 'value'],
                    ])
                })

                it('should handle change (string as value)', () => {
                    const onChangeSpy = jest.fn()
                    const component = shallow(
                        <TagsSelectContainer
                            tags={tags}
                            value={'billing, bugs'}
                            multiple={true}
                            onChange={onChangeSpy}
                            actions={actions}
                        />
                    ).instance()

                    component._onChange(['new', 'value'])
                    expect(onChangeSpy.mock.calls[0]).toEqual(['new,value'])
                })
            })

            it('should render a SelectField', () => {
                const component = shallow(
                    <TagsSelectContainer
                        value={'billing'}
                        tags={tags}
                        onChange={jest.fn()}
                    />
                )
                expect(component).toMatchSnapshot()
            })

            it('should handle change', () => {
                const onChange = jest.fn()
                const component = shallow(
                    <TagsSelectContainer
                        tags={tags}
                        value={'billing'}
                        multiple={false}
                        onChange={onChange}
                        actions={actions}
                    />
                ).instance()

                component._onChange(['new'])
                expect(onChange.mock.calls[0]).toEqual([['new']])
            })
        })
    })
})
