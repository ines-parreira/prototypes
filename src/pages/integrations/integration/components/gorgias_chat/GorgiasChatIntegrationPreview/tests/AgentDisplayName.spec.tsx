import React from 'react'
import {render} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {GorgiasChatAvatarNameType} from 'models/integration/types'
import {AgentDisplayName} from '../AgentDisplayName'

describe('<AgentDisplayName />', () => {
    const name = 'John Doe'

    it('should render agent full name as legacy implementation', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: false,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={undefined}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent first name', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FIRST_NAME}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent first name last name initial', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent first name only if last name is not available', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name="John"
                type={GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent full name', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.AGENT_FULLNAME}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render chat title', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle="Acme Support"
                name={name}
                type={GorgiasChatAvatarNameType.CHAT_TITLE}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render agent fullname if chat title is not provided', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
        }))

        const {container} = render(
            <AgentDisplayName
                className="acme"
                chatTitle={undefined}
                name={name}
                type={GorgiasChatAvatarNameType.CHAT_TITLE}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
