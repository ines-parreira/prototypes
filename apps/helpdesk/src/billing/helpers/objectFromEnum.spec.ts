import { ObjectFromEnum } from './objectFromEnum'

enum Keys {
    One = 'one',
    Two = 'two',
}

type KeyedObject = { [key in Keys]: boolean }

const keyMapper = (key: Keys) => key === Keys.One
const indexMapper = (__key: Keys, index: number) => index === 0

describe('objectFromEnum', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('typing', () => {
        describe('should raise no errors when used correctly', () => {
            it('has a correct key-based mapping function', () => {
                const value = ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    keyMapper,
                )
                const __one = value.one
                const __two = value.two
                // @ts-expect-error - three doesn't exist on KeyedObject
                const __three = value.three

                expect(value).toEqual({
                    one: true,
                    two: false,
                } satisfies KeyedObject)
            })

            it('has a correct index-based mapping function', () => {
                const value = ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    indexMapper,
                )
                const __one = value.one
                const __type = value.two
                // @ts-expect-error - three doesn't exist on KeyedObject
                const __three = value.three

                expect(value).toEqual({
                    one: true,
                    two: false,
                } satisfies KeyedObject)
            })
        })

        describe('should raise an error if the enum type contains values other than string | number', () => {
            it('has a boolean', () => {
                type BadKeys = {
                    One: 'one'
                    Two: 'two'
                    Three: boolean
                }

                const keys: BadKeys = {
                    One: 'one',
                    Two: 'two',
                    Three: true,
                }

                // @ts-expect-error - BadKeys has a boolean
                ObjectFromEnum<BadKeys, {}>(
                    keys,
                    (__key: 'one' | 'two') => true,
                )
            })

            it('has a function', () => {
                type BadKeys = {
                    One: 'one'
                    Two: 'two'
                    Three: () => void
                }

                const keys: BadKeys = {
                    One: 'one',
                    Two: 'two',
                    Three: () => {},
                }

                // @ts-expect-error - BadKeys has a function
                ObjectFromEnum<BadKeys, {}>(
                    keys,
                    (__key: 'one' | 'two') => true,
                )
            })

            it('has an object', () => {
                type BadKeys = {
                    One: 'one'
                    Two: 'two'
                    Three: {}
                }

                const keys: BadKeys = {
                    One: 'one',
                    Two: 'two',
                    Three: {},
                }

                // @ts-expect-error - BadKeys has an object
                ObjectFromEnum<BadKeys, {}>(
                    keys,
                    (__key: 'one' | 'two') => true,
                )
            })
        })

        describe('should raise an error if the object type does not implement [key in typeof Enum]', () => {
            it('has missing keys', () => {
                type BadObject = {
                    one: boolean
                }

                // @ts-expect-error - BadObject is missing 'two'
                ObjectFromEnum<typeof Keys, BadObject>(Keys, keyMapper)
            })

            it('has additional keys', () => {
                type BadObject = {
                    one: boolean
                    two: boolean
                    three: boolean
                }

                // @ts-expect-error - BadObject contains extra key 'three'
                ObjectFromEnum<typeof Keys, BadObject>(Keys, keyMapper)
            })
        })

        describe('should raise an error if the mapper function does not match the required signature', () => {
            it('has an incorrect Key type', () => {
                enum BadKeys {
                    Three = 'three',
                    Four = 'four',
                }

                ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    // @ts-expect-error
                    (__keys: BadKeys) => true,
                )
            })

            it('has an incorrect index type', () => {
                ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    // @ts-expect-error
                    (__keys: Keys, __index: boolean) => true,
                )
            })

            it('has an incorrect return type', () => {
                ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    // @ts-expect-error
                    (__keys: Keys, __index: number) => 0,
                )
            })
        })
    })

    describe('mapper function', () => {
        const mapper = jest.fn()

        it('should map values correctly', () => {
            ObjectFromEnum<typeof Keys, KeyedObject>(Keys, mapper)
            expect(mapper).toHaveBeenNthCalledWith(1, Keys.One, 0)
            expect(mapper).toHaveBeenNthCalledWith(2, Keys.Two, 1)
        })

        it('should handle numeric enums by filtering out reverse mappings', () => {
            enum NumericKeys {
                First = 0,
                Second = 1,
            }
            type NumericKeyedObject = { [key in NumericKeys]: string }
            const numericMapper = jest.fn((key: NumericKeys) => `value-${key}`)

            ObjectFromEnum<typeof NumericKeys, NumericKeyedObject>(
                NumericKeys,
                numericMapper,
            )

            expect(numericMapper).toHaveBeenCalledTimes(2)
            expect(numericMapper).toHaveBeenNthCalledWith(
                1,
                NumericKeys.First,
                0,
            )
            expect(numericMapper).toHaveBeenNthCalledWith(
                2,
                NumericKeys.Second,
                1,
            )
        })

        it('should handle mixed string-number enums', () => {
            enum MixedKeys {
                StringKey = 'string',
                NumericKey = 42,
            }
            type MixedKeyedObject = { [key in MixedKeys]: boolean }
            const mixedMapper = jest.fn(() => true)

            ObjectFromEnum<typeof MixedKeys, MixedKeyedObject>(
                MixedKeys,
                mixedMapper,
            )

            expect(mixedMapper).toHaveBeenCalledTimes(2)
            expect(mixedMapper).toHaveBeenNthCalledWith(
                1,
                MixedKeys.StringKey,
                0,
            )
            expect(mixedMapper).toHaveBeenNthCalledWith(
                2,
                MixedKeys.NumericKey,
                1,
            )
        })

        it('should propagate errors', () => {
            expect(() =>
                ObjectFromEnum<typeof Keys, KeyedObject>(
                    Keys,
                    (__key: Keys) => {
                        throw new Error('something bad happened!')
                    },
                ),
            ).toThrow('something bad happened!')
        })
    })
})
