import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import CommentBodyCell from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/CommentBodyCell'

describe('<CommentBodyCell>', () => {
    it('should render comment', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <CommentBodyCell
                            comment={'Great & helpful as always!'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('Great & helpful as always!')).toBeInTheDocument()
    })

    it('should truncate comment with elipsis when longer than 250 chars', () => {
        const longComment = 'a'.repeat(300)
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <CommentBodyCell comment={longComment} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText(`${longComment.slice(0, 247)}...`)).toBeInTheDocument()
    })

    it('should render NOT_AVAILABLE_PLACEHOLDER when comment is not provided', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <CommentBodyCell comment={null} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
