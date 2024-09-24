import {render} from '@testing-library/react'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import useAutoQA from '../../hooks/useAutoQA'
import AutoQA from '../AutoQA'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('../../hooks/useAutoQA', () => jest.fn())
const useAutoQAMock = useAutoQA as jest.Mock

jest.mock('../AutoQASkeleton', () => () => <div>Loading...</div>)
jest.mock('../Dimension', () => () => <p>Dimension</p>)

describe('AutoQA', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(1)
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })
    })

    it('should render the component', () => {
        const {getByText} = render(<AutoQA />)
        expect(getByText('Auto QA Score')).toBeInTheDocument()
    })

    it('should render a skeleton while data is loading', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [{name: 'communication_skills'}, {name: 'resolution'}],
            isLoading: true,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })

        const {getByText} = render(<AutoQA />)
        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should render a message if there is no data available', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: null,
        })

        const {getByText} = render(<AutoQA />)
        expect(getByText('Score not available.')).toBeInTheDocument()
    })

    it('should render each returned dimension', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [{name: 'communication_skills'}, {name: 'resolution'}],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })

        const {getAllByText} = render(<AutoQA />)
        const els = getAllByText('Dimension')
        expect(els.length).toBe(2)
    })

    it('should render the last updated time', () => {
        const now = new Date()
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [{name: 'communication_skills'}, {name: 'resolution'}],
            isLoading: false,
            lastUpdated: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                21,
                0,
                0
            ),
        })
        const {getByText} = render(<AutoQA />)
        expect(getByText('Last updated: Today at 9:00 PM')).toBeInTheDocument()
    })
})
