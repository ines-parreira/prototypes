import { ScoredSurveyDataKey } from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import { OrderDirection } from 'models/api/types'
import { sortScoredSurveyData } from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/utils'

const sampleScoredSurveyData = [
    {
        assignee: 'Frank Sinatra',
        comment: 'Great & helpful as always!',
        customerName: 'Gloria Schaefer',
        surveyCustomerId: '3',
        surveyScore: '5',
        surveyScoredDate: '2025-02-17T15:01:18.000',
        ticketId: '3',
    },
    {
        assignee: 'John Lennon',
        comment: 'Needs improvement.',
        customerName: 'Paul McCartney',
        surveyCustomerId: '1',
        surveyScore: '3',
        surveyScoredDate: '2025-01-10T10:45:30.000',
        ticketId: '1',
    },
    {
        assignee: 'Elvis Presley',
        comment: 'Good experience!',
        customerName: 'Mick Jagger',
        surveyCustomerId: '2',
        surveyScore: '4',
        surveyScoredDate: '2024-12-05T08:30:00.000',
        ticketId: '2',
    },
    {
        assignee: 'Aretha Franklin',
        comment: null,
        customerName: 'Whitney Houston',
        surveyCustomerId: '4',
        surveyScore: null,
        surveyScoredDate: '2025-02-01T12:00:00.000',
        ticketId: '4',
    },
    {
        assignee: 'Freddie Mercury',
        comment: 'Excellent service!',
        customerName: 'David Bowie',
        surveyCustomerId: '5',
        surveyScore: '5',
        surveyScoredDate: '2025-02-20T09:15:00.000',
        ticketId: '5',
    },
    {
        assignee: 'Madonna',
        comment: 'Quick response time.',
        customerName: 'Prince',
        surveyCustomerId: '6',
        surveyScore: '2',
        surveyScoredDate: null,
        ticketId: '6',
    },
    {
        assignee: null,
        comment: 'Neutral experience.',
        customerName: 'Adele',
        surveyCustomerId: '7',
        surveyScore: '3',
        surveyScoredDate: '2025-01-15T14:10:45.000',
        ticketId: '7',
    },
]

describe('sortScoredSurveyData', () => {
    it('should sort by surveyScore in ascending order', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.SURVEY_SCORE,
            OrderDirection.Asc,
        )
        expect(sorted.map((item) => item.surveyScore)).toEqual([
            '2',
            '3',
            '3',
            '4',
            '5',
            '5',
            null,
        ])
    })

    it('should sort by surveyScore in descending order', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.SURVEY_SCORE,
            OrderDirection.Desc,
        )
        expect(sorted.map((item) => item.surveyScore)).toEqual([
            '5',
            '5',
            '4',
            '3',
            '3',
            '2',
            null,
        ])
    })

    it('should sort by surveyScoredDate in ascending order', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.SURVEY_SCORED_DATE,
            OrderDirection.Asc,
        )
        expect(sorted.map((item) => item.surveyScoredDate)).toEqual([
            '2024-12-05T08:30:00.000',
            '2025-01-10T10:45:30.000',
            '2025-01-15T14:10:45.000',
            '2025-02-01T12:00:00.000',
            '2025-02-17T15:01:18.000',
            '2025-02-20T09:15:00.000',
            null,
        ])
    })

    it('should sort by surveyScoredDate in descending order', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.SURVEY_SCORED_DATE,
            OrderDirection.Desc,
        )
        expect(sorted.map((item) => item.surveyScoredDate)).toEqual([
            '2025-02-20T09:15:00.000',
            '2025-02-17T15:01:18.000',
            '2025-02-01T12:00:00.000',
            '2025-01-15T14:10:45.000',
            '2025-01-10T10:45:30.000',
            '2024-12-05T08:30:00.000',
            null,
        ])
    })

    it('should sort by assignee in ascending order with null last', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.ASSIGNEE,
            OrderDirection.Asc,
        )
        expect(sorted.map((item) => item.assignee)).toEqual([
            'Aretha Franklin',
            'Elvis Presley',
            'Frank Sinatra',
            'Freddie Mercury',
            'John Lennon',
            'Madonna',
            null,
        ])
    })

    it('should sort by assignee in descending order with null last', () => {
        const sorted = sortScoredSurveyData(
            sampleScoredSurveyData,
            ScoredSurveyDataKey.ASSIGNEE,
            OrderDirection.Asc,
        )
        expect(sorted.map((item) => item.assignee)).toEqual([
            'Aretha Franklin',
            'Elvis Presley',
            'Frank Sinatra',
            'Freddie Mercury',
            'John Lennon',
            'Madonna',
            null,
        ])
    })
})
