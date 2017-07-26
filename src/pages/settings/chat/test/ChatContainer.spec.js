import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {ChatContainer} from '../ChatContainer'

describe('ChatContainer component', () => {
    it('should render the chat settings container', () => {
        const component = mount(
            <ChatContainer
                chatSettings={fromJS({})}
                submitSetting={_noop}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should set autoResponderEnabled value', () => {
        const component = mount(
            <ChatContainer
                chatSettings={fromJS({
                    data: {
                        autoResponderEnabled: true
                    }
                })}
                submitSetting={_noop}
            />
        )
        expect(component.find('#id-autoResponderEnabled').props().checked).toBe(true)
    })

    it('should set autoResponderText value', () => {
        const autoResponderText = 'Pizza Pepperoni'
        const component = mount(
            <ChatContainer
                chatSettings={fromJS({
                    data: {autoResponderText}
                })}
                submitSetting={_noop}
            />
        )
        expect(component.find('#id-autoResponderText').props().value).toBe(autoResponderText)
    })

    it('should set timeBeforeSplit value', () => {
        const timeBeforeSplit = 1
        const component = mount(
            <ChatContainer
                chatSettings={fromJS({
                    data: {
                        time_before_split: timeBeforeSplit
                    }
                })}
                submitSetting={_noop}
            />
        )
        expect(component.find('#id-timeBeforeSplit').props().value).toBe(timeBeforeSplit)
    })

    it('should submit the form with defaults', () => {
        const submitSpy = jest.fn()
        const submitSetting = (data) => {
            submitSpy(data)
            return Promise.resolve()
        }
        const setting = {
            type: 'chat',
            data: {
                autoResponderEnabled: false,
                autoResponderText: 'We\'re not online at the moment. Leave us your email and we\'ll follow up shortly.',
                time_before_split: 3 * 60 * 60
            }
        }

        const component = mount(
            <ChatContainer
                chatSettings={fromJS({})}
                submitSetting={submitSetting}
            />
        )

        component.find('form').simulate('submit')
        expect(submitSpy).toBeCalledWith(setting)
    })

    it('should submit the form with loaded values', () => {
        const submitSpy = jest.fn()
        const submitSetting = (data) => {
            submitSpy(data)
            return Promise.resolve()
        }
        const setting = {
            id: 1,
            type: 'chat',
            data: {
                customProperty: 'Pizza Pepperoni',
                autoResponderEnabled: true,
                autoResponderText: 'Pizza Pepperoni',
                time_before_split: 1
            }
        }

        const component = mount(
            <ChatContainer
                chatSettings={fromJS(setting)}
                submitSetting={submitSetting}
            />
        )

        component.find('form').simulate('submit')
        expect(submitSpy).toBeCalledWith(setting)
    })
})
