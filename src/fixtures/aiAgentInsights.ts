import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'

export const emptyMetric = {
    isFetching: false,
    isError: false,
    data: {
        value: null,
        decile: null,
        allData: [],
    },
}

export const customFieldsMetric = {
    isFetching: false,
    isError: false,
    data: {
        value: null,
        decile: null,
        allData: [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::Other',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '1',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::App',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '1',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::Platform',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '3',
            },
        ],
    },
}

export const totalTicketsMetric = {
    isFetching: false,
    isError: false,
    data: {
        value: null,
        decile: null,
        allData: [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::Other',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '5',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::App',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '4',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'Other::Platform',
                [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '10',
            },
        ],
    },
}

export const csatPerIntentMetric = {
    isFetching: false,
    isError: false,
    data: {
        value: null,
        decile: null,
        allData: [
            {
                'TicketCustomFieldsEnriched.valueString': 'Marketing::Other',
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': '5',
                decile: '9',
            },
            {
                'TicketCustomFieldsEnriched.valueString': 'Feedback::Negative',
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': '5',
                decile: '6',
            },
            {
                'TicketCustomFieldsEnriched.valueString': 'Other::Other',
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': '2.3',
                decile: '2',
            },
        ],
    },
}
