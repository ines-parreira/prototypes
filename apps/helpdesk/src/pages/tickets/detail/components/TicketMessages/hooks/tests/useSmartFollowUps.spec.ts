import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'

import { SmartFollowUpType } from 'models/ticket/types'

import { useSmartFollowUps } from '../useSmartFollowUps'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

describe('useSmartFollowUps', () => {
    const expectedDefaultResult = {
        shouldRenderMessageContent: true,
        shouldRenderSmartFollowUps: false,
        smartFollowUps: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Feature flag disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should return empty follow ups and indication that the content should render', () => {
            const result = useSmartFollowUps({})

            expect(result).toStrictEqual(expectedDefaultResult)
        })
    })

    describe('Feature flag enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        describe('default return value - empty follow ups and indication that the content should render', () => {
            const mockMetadataCases = [
                undefined,
                null,
                [],
                1,
                'string',
                () => {},
                null,
            ]

            it.each(mockMetadataCases)(
                'should return default value if the given metadata is %p',
                (metadata) => {
                    const result = useSmartFollowUps(metadata)
                    expect(result).toStrictEqual(expectedDefaultResult)
                },
            )

            const mockSelectedSmartFollowUpIndexCases = [null, 'string']

            it.each(mockSelectedSmartFollowUpIndexCases)(
                'should return default value if the given selected_smart_follow_up_index is %p',
                (value) => {
                    const result = useSmartFollowUps({
                        selected_smart_follow_up_index: value,
                    })

                    expect(result).toStrictEqual(expectedDefaultResult)
                },
            )

            const mockSmartFollowUpsCases = [
                { description: 'empty object', value: {} },
                {
                    description: 'missing text',
                    value: { type: SmartFollowUpType.DYNAMIC },
                },
                {
                    description: 'invalid text',
                    value: { text: 1, type: SmartFollowUpType.DYNAMIC },
                },
                {
                    description: 'missing type',
                    value: { text: 'Order status' },
                },
                {
                    description: 'invalid type',
                    value: {
                        text: 'Order status',
                        type: 'invalid',
                    },
                },
            ]

            it.each(mockSmartFollowUpsCases)(
                'should return default value if the smart_follow_ups are invalid - $description',
                ({ value }) => {
                    const result = useSmartFollowUps({
                        smart_follow_ups: [value],
                    })

                    expect(result).toStrictEqual(expectedDefaultResult)
                },
            )
        })

        describe('conditional rendering control', () => {
            const mockSmartFollowUps = [
                {
                    text: 'Order status',
                    type: SmartFollowUpType.DYNAMIC,
                },
            ]

            it('should indicate that the content should be rendered if there are no smart follow ups', () => {
                const result = useSmartFollowUps({})

                expect(result).toStrictEqual({
                    shouldRenderMessageContent: true,
                    shouldRenderSmartFollowUps: false,
                    smartFollowUps: [],
                    selectedSmartFollowUpIndex: undefined,
                })
            })

            it('should indicate that both the content and smart follow ups should be rendered if no smart follow up was selected', () => {
                const result = useSmartFollowUps({
                    smart_follow_ups: mockSmartFollowUps,
                })

                expect(result).toStrictEqual({
                    shouldRenderMessageContent: true,
                    shouldRenderSmartFollowUps: true,
                    smartFollowUps: mockSmartFollowUps,
                    selectedSmartFollowUpIndex: undefined,
                })
            })

            it('should indicate that the smart follow ups should be rendered if a smart follow up was selected', () => {
                const result = useSmartFollowUps({
                    smart_follow_ups: mockSmartFollowUps,
                    selected_smart_follow_up_index: 0,
                })

                expect(result).toStrictEqual({
                    shouldRenderMessageContent: false,
                    shouldRenderSmartFollowUps: true,
                    smartFollowUps: mockSmartFollowUps,
                    selectedSmartFollowUpIndex: 0,
                })
            })
        })
    })
})
