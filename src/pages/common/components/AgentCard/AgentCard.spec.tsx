import {render, screen} from '@testing-library/react'
import React from 'react'

import Avatar from 'pages/common/components/Avatar/Avatar'

import AgentCard from './AgentCard'

jest.mock('pages/common/components/Avatar/Avatar')

const AvatarMock = Avatar as unknown as jest.Mock

describe('AgentCard', () => {
    const defaultProps = {
        name: 'John Doe',
        url: 'https://example.com/avatar.png',
        badgeColor: '#ff0000',
        description: 'Lorem ipsum dolor sit amet',
    }

    const renderComponent = (props = {defaultProps}) =>
        render(<AgentCard {...defaultProps} {...props} />)

    it('should render the agent name and description', () => {
        renderComponent()
        expect(screen.getByText(defaultProps.name)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
    })

    it('should render the agent avatar with the correct props', () => {
        renderComponent()
        expect(AvatarMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shape: 'round',
                name: defaultProps.name,
                url: defaultProps.url,
                size: 36,
                badgeColor: defaultProps.badgeColor,
            }),
            {}
        )
    })
})
