import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { GorgiasChatIntegrationInstallRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall'

const mockInstallationCard = jest.fn()
const mockAdvancedInstallationCard = jest.fn()
const mockDeleteCard = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
        }: {
            children: React.ReactNode
        }) => children,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/InstallationCard/InstallationCard',
    () => (props: any) => {
        mockInstallationCard(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/AdvancedInstallationCard/AdvancedInstallationCard',
    () => (props: any) => {
        mockAdvancedInstallationCard(props)
        return null
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/DeleteCard/DeleteCard',
    () => (props: any) => {
        mockDeleteCard(props)
        return null
    },
)

describe('GorgiasChatIntegrationInstallRevamp', () => {
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
            <GorgiasChatIntegrationInstallRevamp
                integration={integration}
                actions={actions}
            />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
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
})
