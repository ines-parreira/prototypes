import React from 'react'

import { render } from '@testing-library/react'

import { GorgiasChatAvatarNameType } from 'models/integration/types'

import { AgentDisplayName } from '../AgentDisplayName'

describe('<AgentDisplayName />', () => {
    const name = 'John Doe'

    it('should render agent first name', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FIRST_NAME}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent first name last name initial', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent first name only if last name is not available', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name="John"
                type={GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent full name', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FULLNAME}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render chat title', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.CHAT_TITLE}
            />,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent fullname if chat title is not provided', () => {
        const { container } = render(
            <AgentDisplayName
                className="acme"
                chatTitle={undefined}
                name={name}
                type={GorgiasChatAvatarNameType.CHAT_TITLE}
            />,
        )

        expect(container).toMatchSnapshot()
    })
})
