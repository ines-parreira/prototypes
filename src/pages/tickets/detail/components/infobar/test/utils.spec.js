import expect from 'expect'
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

    describe('droppable path', () => {
        const inputs = [
            {
                value: '',
                expect: ''
            },
            {
                value: 'ticket',
                expect: ''
            },
            {
                value: 'ticket.requester[]',
                expect: 'ticket'
            },
            {
                value: 'ticket.requester[].hello',
                expect: 'ticket.requester[]'
            },
            {
                value: 'ticket.requester[].hello.world',
                expect: 'ticket.requester[].hello'
            },
            {
                value: 'ticket.requester[].hello[].world',
                expect: 'ticket.requester[].hello[]'
            },
            {
                value: 'ticket.requester[].hello[]',
                expect: 'ticket.requester[]'
            },
            {
                value: 'ticket.requester[].hello[][]',
                expect: 'ticket.requester[]'
            }
        ]

        it('transform OK', () => {
            inputs.forEach((input) => {
                expect(utils.droppablePath(input.value)).toBe(input.expect)
            })
        })
    })

    describe('humanize string', () => {
        const inputs = [
            {
                value: '',
                expect: ''
            },
            {
                value: 'ticket',
                expect: 'Ticket'
            },
            {
                value: 'customerOrders',
                expect: 'Customer orders'
            },
            {
                value: 'order_id',
                expect: 'Order id'
            },
            {
                value: 'helper hello',
                expect: 'Helper hello'
            }
        ]

        it('transform OK', () => {
            inputs.forEach((input) => {
                expect(utils.humanizeString(input.value)).toBe(input.expect)
            })
        })
    })

    describe('are sources ready', () => {
        const correct = [
            fromJS({
                ticket: {
                    requester: {
                        customer: {
                            name: 'hello'
                        }
                    }
                }
            }),
            fromJS({
                ticket: {
                    requester: {
                        customer: {
                            age: 33,
                            list: [
                                'hello'
                            ]
                        }
                    }
                }
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
            })
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.areSourcesReady(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.areSourcesReady(input)).toBe(false)
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
            expect(utils.jsonToWidget(source)).toInclude(result)
        })
    })
})
