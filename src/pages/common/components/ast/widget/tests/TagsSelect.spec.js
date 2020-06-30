import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TagsSelectContainer, {TagsSelect} from '../TagsSelect'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

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
            let store = null
            const actions = {
                create: jest.fn(),
            }

            beforeEach(() => {
                store = mockStore({
                    tags: fromJS({
                        items: tags,
                    }),
                })
            })

            describe('MultiSelectField', () => {
                it('should render array as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            value={['billing', 'bugs']}
                            store={store}
                            onChange={jest.fn()}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should render string as value', () => {
                    const component = shallow(
                        <TagsSelectContainer
                            value={'billing, bugs'}
                            store={store}
                            multiple={true}
                            onChange={jest.fn()}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should handle change (array as value)', () => {
                    const onChangeSpy = jest.fn()
                    const component = shallow(
                        <TagsSelect
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
                        <TagsSelect
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
                        store={store}
                        onChange={jest.fn()}
                    />
                )
                expect(component.dive()).toMatchSnapshot()
            })

            it('should handle change', () => {
                const onChange = jest.fn()
                const component = shallow(
                    <TagsSelect
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
