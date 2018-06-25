import {fromJS} from 'immutable'
import * as utils from '../utils'

describe('widgets infobar utils', () => {
    describe('is array of objects', () => {
        const correct = [
            [{
                hello: 'world'
            }]
        ]

        const incorrect = [
            undefined,
            null,
            '',
            {},
            fromJS([]),
            fromJS({}),
            'hello',
            [],
            ['hello']
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isArrayOfObjects(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isArrayOfObjects(input)).toBe(false)
            })
        })
    })

    describe('is object', () => {
        const correct = [
            {
                hello: 'world'
            },
            {},
            fromJS([]),
            fromJS({})
        ]

        const incorrect = [
            undefined,
            null,
            '',
            'hello',
            [],
            ['hello']
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isObject(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isObject(input)).toBe(false)
            })
        })
    })

    describe('are sources ready', () => {
        const correct = [
            fromJS({
                ticket: {
                    customer: {
                        data: {
                            name: 'hello'
                        }
                    }
                }
            }),
            fromJS({
                ticket: {
                    customer: {
                        data: {
                            age: 33,
                            list: [
                                'hello'
                            ]
                        }
                    }
                }
            })
        ]

        const incorrect = [
            fromJS({
                ticket: {
                    requester: {}
                }
            }),
            fromJS({
                ticket: {
                    orders: []
                }
            }),
            fromJS({
                imaginaryKey: {}
            }),
            fromJS({
                imaginaryKey: {
                    something: {
                        really: 'yes'
                    }
                }
            }),
            fromJS({})
        ]

        const context = 'ticket'

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.areSourcesReady(input, context, false)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.areSourcesReady(input, context, false)).toBe(false)
            })
        })
    })

    describe('json to widgets', () => {
        const source = {
            list: [{
                name: 'Michael'
            }, {
                name: 'Julien'
            }],
            customer: {
                name: 'Pedro',
                url: 'http://google.com',
                children: [{
                    name: 'Sylvie'
                }]
            },
            description: 'Best friend'
        }

        const result = {
            path: '',
            title: '',
            type: 'card',
            widgets: [{
                path: 'description',
                title: 'Description',
                type: 'text'
            }, {
                path: 'customer',
                title: 'Customer',
                type: 'card',
                widgets: [{
                    path: 'name',
                    title: 'Name',
                    type: 'text'
                }, {
                    path: 'url',
                    title: 'Url',
                    type: 'url'
                }, {
                    path: 'children',
                    type: 'list',
                    widgets: [{
                        title: 'Children',
                        type: 'card',
                        widgets: [{
                            path: 'name',
                            title: 'Name',
                            type: 'text'
                        }]
                    }]
                }]
            }, {
                path: 'list',
                type: 'list',
                widgets: [{
                    title: 'List',
                    type: 'card',
                    widgets: [{
                        path: 'name',
                        title: 'Name',
                        type: 'text'
                    }]
                }]
            }]
        }

        it('templating OK', () => {
            expect(utils.jsonToWidget(source)).toEqual(result)
        })
    })
})
