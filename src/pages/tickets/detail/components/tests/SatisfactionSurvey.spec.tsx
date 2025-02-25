import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import SatisfactionSurvey from '../SatisfactionSurvey'

jest.mock('pages/common/utils/DatetimeLabel', () => () => <div>datetime</div>)

describe('SatisfactionSurvey', () => {
    it('should display satisfaction survey', () => {
        const { container } = render(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    body_text: 'test',
                    score: 3,
                    scored_datetime: 'now',
                })}
                customer={fromJS({
                    name: 'test me',
                })}
                isLast
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle regular satisfaction survey data', () => {
        const { getByText } = render(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    body_text: 'Great service!',
                    score: 5,
                    scored_datetime: '2024-01-01T00:00:00Z',
                })}
                customer={fromJS({
                    name: 'John Doe',
                })}
                isLast={false}
            />,
        )

        expect(getByText('5 stars CSAT review')).toBeInTheDocument()
        expect(getByText('Great service!')).toBeInTheDocument()
    })

    it('should handle satisfaction survey as event data', () => {
        const { getByText } = render(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    isEvent: true,
                    created_datetime: '2024-01-01T00:00:00Z',
                    data: {
                        score: 4,
                        body_text: 'Good experience with support',
                    },
                })}
                customer={fromJS({
                    name: 'John Doe',
                })}
                isLast={false}
            />,
        )

        expect(getByText('4 stars CSAT review')).toBeInTheDocument()
        expect(getByText('Good experience with support')).toBeInTheDocument()
        expect(getByText('datetime')).toBeInTheDocument()
    })

    it('should handle sent status', () => {
        const { getByText } = render(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    sent_datetime: '2024-01-01T00:00:00Z',
                })}
                customer={fromJS({
                    name: 'John Doe',
                })}
                isLast={false}
            />,
        )

        expect(getByText('Was sent')).toBeInTheDocument()
    })

    it('should handle to be sent status', () => {
        const { getByText } = render(
            <SatisfactionSurvey
                satisfactionSurvey={fromJS({
                    should_send_datetime: '2024-01-01T00:00:00Z',
                })}
                customer={fromJS({
                    name: 'John Doe',
                })}
                isLast={false}
            />,
        )

        expect(getByText('To be sent')).toBeInTheDocument()
    })
})
