import esprima from 'esprima'
import {
    ManagedRule,
    ManagedRulesSlugs,
    Rule,
    RuleType,
} from '../state/rules/types'

export const emptyRule = {
    id: 1,
    description: 'foo',
    name: 'my rule',
    code_ast: {} as ReturnType<typeof esprima.parse>,
    code: '',
    event_types: 'ticket-created',
    deactivated_datetime: null,
    created_datetime: '2020-01-01T00:00:00',
    updated_datetime: '2020-01-01T00:00:00',
    priority: 100,
    type: RuleType.User,
    uri: '/api/rule/17',
} as Rule

export const emptyManagedRule = {
    id: 1,
    description: 'foo',
    name: 'my rule',
    code_ast: {},
    code: '',
    event_types: '',
    deactivated_datetime: null,
    created_datetime: '2020-01-01T00:00:00',
    updated_datetime: '2020-01-01T00:00:00',
    priority: 100,
    type: RuleType.Managed,
    uri: '/api/rule/1',
    settings: {slug: ManagedRulesSlugs.AutoCloseSpam},
} as ManagedRule

export const rule = {
    priority: 6,
    deactivated_datetime: '2021-01-15T15:26:02.575404+00:00',
    name: 'Set tags',
    uri: '/api/rules/7/',
    code: "if (eq(message.source.from.address, 'alex@gorgias.io')) {\n    Action('setTags', { tags: 'set' })\n}",
    code_ast: {
        loc: {
            start: {
                line: 1,
                column: 0,
            },
            end: {
                line: 3,
                column: 1,
            },
        },
        type: 'Program',
        body: [
            {
                loc: {
                    start: {
                        line: 1,
                        column: 0,
                    },
                    end: {
                        line: 3,
                        column: 1,
                    },
                },
                type: 'IfStatement',
                test: {
                    loc: {
                        start: {
                            line: 1,
                            column: 4,
                        },
                        end: {
                            line: 1,
                            column: 54,
                        },
                    },
                    type: 'CallExpression',
                    callee: {
                        loc: {
                            start: {
                                line: 1,
                                column: 4,
                            },
                            end: {
                                line: 1,
                                column: 6,
                            },
                        },
                        type: 'Identifier',
                        name: 'eq',
                    },
                    arguments: [
                        {
                            loc: {
                                start: {
                                    line: 1,
                                    column: 7,
                                },
                                end: {
                                    line: 1,
                                    column: 34,
                                },
                            },
                            type: 'MemberExpression',
                            computed: false,
                            object: {
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 7,
                                    },
                                    end: {
                                        line: 1,
                                        column: 26,
                                    },
                                },
                                type: 'MemberExpression',
                                computed: false,
                                object: {
                                    loc: {
                                        start: {
                                            line: 1,
                                            column: 7,
                                        },
                                        end: {
                                            line: 1,
                                            column: 21,
                                        },
                                    },
                                    type: 'MemberExpression',
                                    computed: false,
                                    object: {
                                        loc: {
                                            start: {
                                                line: 1,
                                                column: 7,
                                            },
                                            end: {
                                                line: 1,
                                                column: 14,
                                            },
                                        },
                                        type: 'Identifier',
                                        name: 'message',
                                    },
                                    property: {
                                        loc: {
                                            start: {
                                                line: 1,
                                                column: 15,
                                            },
                                            end: {
                                                line: 1,
                                                column: 21,
                                            },
                                        },
                                        type: 'Identifier',
                                        name: 'source',
                                    },
                                },
                                property: {
                                    loc: {
                                        start: {
                                            line: 1,
                                            column: 22,
                                        },
                                        end: {
                                            line: 1,
                                            column: 26,
                                        },
                                    },
                                    type: 'Identifier',
                                    name: 'from',
                                },
                            },
                            property: {
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 27,
                                    },
                                    end: {
                                        line: 1,
                                        column: 34,
                                    },
                                },
                                type: 'Identifier',
                                name: 'address',
                            },
                        },
                        {
                            loc: {
                                start: {
                                    line: 1,
                                    column: 36,
                                },
                                end: {
                                    line: 1,
                                    column: 53,
                                },
                            },
                            type: 'Literal',
                            value: 'alex@gorgias.io',
                            raw: "'alex@gorgias.io'",
                        },
                    ],
                },
                consequent: {
                    loc: {
                        start: {
                            line: 1,
                            column: 56,
                        },
                        end: {
                            line: 3,
                            column: 1,
                        },
                    },
                    type: 'BlockStatement',
                    body: [
                        {
                            loc: {
                                start: {
                                    line: 2,
                                    column: 4,
                                },
                                end: {
                                    line: 2,
                                    column: 38,
                                },
                            },
                            type: 'ExpressionStatement',
                            expression: {
                                loc: {
                                    start: {
                                        line: 2,
                                        column: 4,
                                    },
                                    end: {
                                        line: 2,
                                        column: 38,
                                    },
                                },
                                type: 'CallExpression',
                                callee: {
                                    loc: {
                                        start: {
                                            line: 2,
                                            column: 4,
                                        },
                                        end: {
                                            line: 2,
                                            column: 10,
                                        },
                                    },
                                    type: 'Identifier',
                                    name: 'Action',
                                },
                                arguments: [
                                    {
                                        loc: {
                                            start: {
                                                line: 2,
                                                column: 11,
                                            },
                                            end: {
                                                line: 2,
                                                column: 20,
                                            },
                                        },
                                        type: 'Literal',
                                        value: 'setTags',
                                        raw: "'setTags'",
                                    },
                                    {
                                        loc: {
                                            start: {
                                                line: 2,
                                                column: 22,
                                            },
                                            end: {
                                                line: 2,
                                                column: 37,
                                            },
                                        },
                                        type: 'ObjectExpression',
                                        properties: [
                                            {
                                                loc: {
                                                    start: {
                                                        line: 2,
                                                        column: 24,
                                                    },
                                                    end: {
                                                        line: 2,
                                                        column: 35,
                                                    },
                                                },
                                                type: 'Property',
                                                key: {
                                                    loc: {
                                                        start: {
                                                            line: 2,
                                                            column: 24,
                                                        },
                                                        end: {
                                                            line: 2,
                                                            column: 28,
                                                        },
                                                    },
                                                    type: 'Identifier',
                                                    name: 'tags',
                                                },
                                                computed: false,
                                                value: {
                                                    loc: {
                                                        start: {
                                                            line: 2,
                                                            column: 30,
                                                        },
                                                        end: {
                                                            line: 2,
                                                            column: 35,
                                                        },
                                                    },
                                                    type: 'Literal',
                                                    value: 'set',
                                                    raw: "'set'",
                                                },
                                                kind: 'init',
                                                method: false,
                                                shorthand: false,
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                },
                alternate: null,
            },
        ],
        sourceType: 'script',
    },
    created_datetime: '2021-01-15T15:26:02.577755+00:00',
    event_types: 'ticket-created',
    type: 'user',
    id: 7,
    description: 'Set tags',
    updated_datetime: '2021-02-11T13:15:46.420156+00:00',
} as Rule

export const ruleWithBusinessHourIdentifier = {
    priority: 22,
    deactivated_datetime: '2021-04-16T09:03:03+00:00',
    name: 'fixture',
    uri: '/api/rules/23/',
    code: 'if (duringBusinessHours(message.created_datetime)) {\n}',
    code_ast: {
        loc: {start: {line: 1, column: 0}, end: {line: 2, column: 1}},
        type: 'Program',
        body: [
            {
                loc: {start: {line: 1, column: 0}, end: {line: 2, column: 1}},
                type: 'IfStatement',
                test: {
                    loc: {
                        start: {line: 1, column: 4},
                        end: {line: 1, column: 49},
                    },
                    type: 'CallExpression',
                    callee: {
                        loc: {
                            start: {line: 1, column: 4},
                            end: {line: 1, column: 23},
                        },
                        type: 'Identifier',
                        name: 'duringBusinessHours',
                    },
                    arguments: [
                        {
                            loc: {
                                start: {line: 1, column: 24},
                                end: {line: 1, column: 48},
                            },
                            type: 'MemberExpression',
                            computed: false,
                            object: {
                                loc: {
                                    start: {line: 1, column: 24},
                                    end: {line: 1, column: 31},
                                },
                                type: 'Identifier',
                                name: 'message',
                            },
                            property: {
                                loc: {
                                    start: {line: 1, column: 32},
                                    end: {line: 1, column: 48},
                                },
                                type: 'Identifier',
                                name: 'created_datetime',
                            },
                        },
                    ],
                },
                consequent: {
                    loc: {
                        start: {line: 1, column: 51},
                        end: {line: 2, column: 1},
                    },
                    type: 'BlockStatement',
                    body: [],
                },
                alternate: null,
            },
        ],
        sourceType: 'script',
    },
    created_datetime: '2021-04-16T09:03:03.759930+00:00',
    event_types: 'ticket-created',
    type: 'user',
    id: 23,
    description: '',
    updated_datetime: '2021-04-16T09:03:03.759945+00:00',
} as unknown as Rule

export const ruleWithContainsAllIdentifier = {
    priority: 12,
    deactivated_datetime: '2021-05-31T14:06:57.067000+00:00',
    name: 'AUT-210',
    uri: '/api/rules/48/',
    code: 'if (containsAll(ticket.tags.name, [])) {\n}',
    code_ast: {
        loc: {start: {line: 1, column: 0}, end: {line: 2, column: 1}},
        type: 'Program',
        body: [
            {
                loc: {start: {line: 1, column: 0}, end: {line: 2, column: 1}},
                type: 'IfStatement',
                test: {
                    loc: {
                        start: {line: 1, column: 4},
                        end: {line: 1, column: 37},
                    },
                    type: 'CallExpression',
                    callee: {
                        loc: {
                            start: {line: 1, column: 4},
                            end: {line: 1, column: 15},
                        },
                        type: 'Identifier',
                        name: 'containsAll',
                    },
                    arguments: [
                        {
                            loc: {
                                start: {line: 1, column: 16},
                                end: {line: 1, column: 32},
                            },
                            type: 'MemberExpression',
                            computed: false,
                            object: {
                                loc: {
                                    start: {line: 1, column: 16},
                                    end: {line: 1, column: 27},
                                },
                                type: 'MemberExpression',
                                computed: false,
                                object: {
                                    loc: {
                                        start: {line: 1, column: 16},
                                        end: {line: 1, column: 22},
                                    },
                                    type: 'Identifier',
                                    name: 'ticket',
                                },
                                property: {
                                    loc: {
                                        start: {line: 1, column: 23},
                                        end: {line: 1, column: 27},
                                    },
                                    type: 'Identifier',
                                    name: 'tags',
                                },
                            },
                            property: {
                                loc: {
                                    start: {line: 1, column: 28},
                                    end: {line: 1, column: 32},
                                },
                                type: 'Identifier',
                                name: 'name',
                            },
                        },
                        {
                            loc: {
                                start: {line: 1, column: 34},
                                end: {line: 1, column: 36},
                            },
                            type: 'ArrayExpression',
                            elements: [],
                        },
                    ],
                },
                consequent: {
                    loc: {
                        start: {line: 1, column: 39},
                        end: {line: 2, column: 1},
                    },
                    type: 'BlockStatement',
                    body: [],
                },
                alternate: null,
            },
        ],
        sourceType: 'script',
    },
    created_datetime: '2021-05-31T13:08:10.344449+00:00',
    event_types: 'ticket-created',
    type: 'user',
    id: 48,
    description: '',
    updated_datetime: '2021-05-31T14:06:57.119351+00:00',
} as unknown as Rule

export const rules = [
    rule,
    ruleWithBusinessHourIdentifier,
    ruleWithContainsAllIdentifier,
]
