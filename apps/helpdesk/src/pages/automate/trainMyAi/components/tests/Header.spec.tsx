import React from 'react'

import { render, screen } from '@testing-library/react'

import MessageCard from '../MessageCard'

describe('<MessageCard />', () => {
    it('should render component', () => {
        render(
            <MessageCard
                articleTitle="article title"
                message=""
                isSelected
                isSuccess
            />,
        )

        expect(screen.getByText('article title')).toBeInTheDocument()
    })
})
