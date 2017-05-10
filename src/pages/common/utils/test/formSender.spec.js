import {formatErrors} from '../formSender'

describe('formSender', () => {
    describe('formatErrors', () => {
        const txt = 'Error text'
        const txt2 = 'Another error text'
        const tests = [
            {
                res: {
                    username: {
                        1: {
                            _schema: [txt]
                        }
                    }
                },
                rep: {
                    username: [txt]
                }
            },
            {
                res: {
                    username: txt,
                    email: txt,
                },
                rep: {
                    username: txt,
                    email: txt,
                }
            },
            {
                res: {
                    username: [txt],
                    email: txt,
                },
                rep: {
                    username: [txt],
                    email: txt,
                }
            },
            {
                res: {
                    username: {
                        0: txt
                    },
                    email: txt,
                },
                rep: {
                    username: [txt],
                    email: txt,
                }
            },
            {
                res: {
                    username: {
                        0: txt,
                        1: txt2,
                    },
                    email: txt,
                },
                rep: {
                    username: [txt, txt2],
                    email: txt,
                }
            }
        ]

        it('tests OK', () => {
            tests.forEach((test) => {
                expect(formatErrors(test.res)).toEqual(test.rep)
            })
        })
    })
})
