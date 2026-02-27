import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

import GorgiasChatIntegrationInstall from './GorgiasChatIntegrationInstall'

const mockChatSettingsPageHeader = jest.fn()
const mockGorgiasChatIntegrationHeader = jest.fn()
const mockInstallationCard = jest.fn()
const mockAdvancedInstallationCard = jest.fn()
const mockDeleteCard = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/revamp/ChatSettingsPageHeader',
    () => (props: any) => {
        mockChatSettingsPageHeader(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => (props: any) => {
        mockGorgiasChatIntegrationHeader(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/InstallationCard',
    () => (props: any) => {
        mockInstallationCard(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/AdvancedInstallationCard/AdvancedInstallationCard',
    () => (props: any) => {
        mockAdvancedInstallationCard(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/DeleteCard/DeleteCard',
    () => (props: any) => {
        mockDeleteCard(props)
        return null
    },
)

describe('GorgiasChatIntegrationInstall', () => {
    const mockIntegration = fromJS({
        id: 'test-integration-id',
        name: 'Test Chat Integration',
        type: IntegrationType.GorgiasChat,
        meta: {
            shop_integration_id: 1,
        },
    })

    const mockActions = {
        updateOrCreateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
    }

    const renderComponent = (
        integration = mockIntegration,
        actions = mockActions,
    ) => {
        return render(
            <GorgiasChatIntegrationInstall
                integration={integration}
                actions={actions}
            />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('ChatSettingsPageHeader', () => {
        it('should render with correct title', () => {
            renderComponent()

            expect(mockChatSettingsPageHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Settings',
                }),
            )
        })

        it('should pass breadcrumb items with correct structure', () => {
            renderComponent()

            expect(mockChatSettingsPageHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    breadcrumbItems: [
                        {
                            link: `/app/settings/channels/${IntegrationType.GorgiasChat}`,
                            label: 'All chats',
                            id: '1',
                        },
                        {
                            label: 'Test Chat Integration',
                            id: '2',
                        },
                    ],
                }),
            )
        })

        it('should pass onSave callback', () => {
            renderComponent()

            const onSave = mockChatSettingsPageHeader.mock.calls[0][0].onSave

            expect(onSave).toBeDefined()
            expect(typeof onSave).toBe('function')
        })
    })

    describe('GorgiasChatIntegrationHeader', () => {
        it('should render with integration prop', () => {
            renderComponent()

            expect(mockGorgiasChatIntegrationHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: mockIntegration,
                }),
            )
        })

        it('should render with Installation tab', () => {
            renderComponent()

            expect(mockGorgiasChatIntegrationHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    tab: Tab.Installation,
                }),
            )
        })
    })

    describe('InstallationCard', () => {
        it('should render with integration prop', () => {
            renderComponent()

            expect(mockInstallationCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: mockIntegration,
                }),
            )
        })

        it('should pass updateOrCreateIntegration action', () => {
            renderComponent()

            expect(mockInstallationCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    actions: {
                        updateOrCreateIntegration:
                            mockActions.updateOrCreateIntegration,
                    },
                }),
            )
        })
    })

    describe('AdvancedInstallationCard', () => {
        it('should render with integration prop', () => {
            renderComponent()

            expect(mockAdvancedInstallationCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: mockIntegration,
                }),
            )
        })
    })

    describe('DeleteCard', () => {
        it('should render with integration prop', () => {
            renderComponent()

            expect(mockDeleteCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: mockIntegration,
                }),
            )
        })

        it('should pass deleteIntegration action as onDeleteIntegration', () => {
            renderComponent()

            expect(mockDeleteCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    onDeleteIntegration: mockActions.deleteIntegration,
                }),
            )
        })
    })

    describe('breadcrumb items with different integration names', () => {
        it('should use integration name in breadcrumb', () => {
            const customIntegration = fromJS({
                id: 'custom-id',
                name: 'Custom Chat Name',
                type: IntegrationType.GorgiasChat,
            })

            renderComponent(customIntegration)

            expect(mockChatSettingsPageHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    breadcrumbItems: expect.arrayContaining([
                        expect.objectContaining({
                            label: 'Custom Chat Name',
                            id: '2',
                        }),
                    ]),
                }),
            )
        })
    })
})
