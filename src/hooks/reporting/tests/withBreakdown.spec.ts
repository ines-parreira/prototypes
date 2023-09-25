import {
    BREAKDOWN_FIELD,
    selectWithBreakdown,
    TicketCustomFieldsTicketCountData,
    TAG_SEPARATOR,
    VALUE_FIELD,
    withBreakdown,
} from 'hooks/reporting/withBreakdown'
import {DataResponse} from 'hooks/reporting/withDeciles'

describe('withBreakdown', () => {
    const tagL1_1 = 'asd'
    const tagL1_2 = 'rtu'
    const tagL2_1 = 'xyz'
    const tagL2_2 = 'zyx'
    const tagL2_3 = 'same'
    const tagL2_4 = 'jkl'
    const tagL3_1 = 'qwe'
    const tagL3_2 = 'ewq'
    const tagL3_3 = '123'
    const tagL3_4 = 'same'
    const customTags = [
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_1}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_2}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_2}${TAG_SEPARATOR}${tagL3_3}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_3}${TAG_SEPARATOR}${tagL3_4}`,
        `${tagL1_2}${TAG_SEPARATOR}${tagL2_4}`,
    ]

    const results = customTags.map((tag) => ({
        [BREAKDOWN_FIELD]: tag,
        [VALUE_FIELD]: '1',
    }))
    const response: DataResponse<TicketCustomFieldsTicketCountData> = {
        data: {
            data: results,
        },
    }

    describe('withBreakdown', () => {
        it('should replace the response data with data with data breakdown', () => {
            const responseWithDeciles = withBreakdown(response)

            expect(responseWithDeciles.data.data).toEqual(
                selectWithBreakdown(results)
            )
        })
    })

    describe('selectWithBreakdown', () => {
        it('should create a hierarchy', () => {
            const breakdown = selectWithBreakdown(results)

            expect(breakdown).toEqual([
                {
                    [BREAKDOWN_FIELD]: tagL1_1,
                    [VALUE_FIELD]: '4',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_1,
                            [VALUE_FIELD]: '2',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_1,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                                {
                                    [BREAKDOWN_FIELD]: tagL3_2,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_2,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_3,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_3,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_4,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    [BREAKDOWN_FIELD]: tagL1_2,
                    [VALUE_FIELD]: '1',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_4,
                            [VALUE_FIELD]: '1',
                            children: [],
                        },
                    ],
                },
            ])
        })
    })
})
