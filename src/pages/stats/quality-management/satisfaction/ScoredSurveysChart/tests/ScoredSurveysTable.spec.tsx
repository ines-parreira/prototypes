import {Skeleton} from '@gorgias/merchant-ui-kit'
import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import {ScoredSurveyDataKey} from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import {OrderDirection} from 'models/api/types'
import ScoredSurveysTable from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
import {assumeMock} from 'utils/testing'

jest.mock('@gorgias/merchant-ui-kit', () => {
    const actual = jest.requireActual('@gorgias/merchant-ui-kit')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        Skeleton: jest.fn(() => <div>Skeleton</div>),
    }
})
const SkeletonMock = assumeMock(Skeleton)

const data = [
    {
        ticketId: '123',
        surveyScore: '2',
        comment: "didn't understand the issue at all?",
        assignee: 'John Doe',
        customerName: 'Alice',
        surveyCustomerId: '602166910',
        surveyScoredDate: '2025-02-17T09:27:09.000',
    },
    {
        ticketId: '223',
        surveyScore: '5',
        comment: 'Thanks a lot?',
        assignee: 'John Doe',
        customerName: 'Bob',
        surveyCustomerId: '702564323',
        surveyScoredDate: '2025-02-16T09:27:09.000',
    },
]

const tableState = {
    currentPage: 1,
    orderBy: ScoredSurveyDataKey.SURVEY_SCORED_DATE,
    orderDirection: OrderDirection.Desc,
}

const handleSort = jest.fn()

describe('<ScoredSurveysTable>', () => {
    beforeEach(() => {
        SkeletonMock.mockImplementation(() => <div>Skeleton</div>)
    })
    it('should render table header', () => {
        const {getByText} = render(
            <ScoredSurveysTable
                data={data}
                isFetching={false}
                tableState={tableState}
                handleSort={handleSort}
            />
        )

        expect(getByText('date')).toBeInTheDocument()
        expect(getByText('assignee')).toBeInTheDocument()
        expect(getByText('comment')).toBeInTheDocument()
        expect(getByText('customer name')).toBeInTheDocument()
        expect(getByText('score')).toBeInTheDocument()
    })

    it('should render table body content', () => {
        const {getByText, getAllByText, container} = render(
            <ScoredSurveysTable
                data={data}
                isFetching={false}
                tableState={tableState}
                handleSort={handleSort}
            />
        )

        const rows = container.querySelectorAll('tr')

        expect(rows.length).toEqual(3)
        expect(getByText('Alice')).toBeInTheDocument()
        expect(getByText('Bob')).toBeInTheDocument()
        expect(getByText('2')).toBeInTheDocument()
        expect(getByText('5')).toBeInTheDocument()
        expect(
            getByText("didn't understand the issue at all?")
        ).toBeInTheDocument()
        expect(getByText('Thanks a lot?')).toBeInTheDocument()
        expect(getByText('2/17/2025')).toBeInTheDocument()
        expect(getByText('2/16/2025')).toBeInTheDocument()
        getAllByText('star').forEach((star) => expect(star).toBeInTheDocument())
        getAllByText('open_in_new').forEach((star) =>
            expect(star).toBeInTheDocument()
        )
        getAllByText('John Doe').forEach((star) =>
            expect(star).toBeInTheDocument()
        )
    })

    it('should trigger handle sort by clicking on header', () => {
        const {getByText} = render(
            <ScoredSurveysTable
                data={data}
                isFetching={false}
                tableState={tableState}
                handleSort={handleSort}
            />
        )

        const header = getByText('date')
        fireEvent.click(header)

        expect(handleSort).toHaveBeenCalledWith(
            ScoredSurveyDataKey.SURVEY_SCORED_DATE
        )
    })

    it('should render loading state while fetching', () => {
        const {getAllByText} = render(
            <ScoredSurveysTable
                data={data}
                isFetching={true}
                tableState={tableState}
                handleSort={handleSort}
            />
        )

        const skeletons = getAllByText('Skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
