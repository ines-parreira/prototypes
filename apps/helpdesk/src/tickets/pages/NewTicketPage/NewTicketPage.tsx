import { useEffect } from 'react'

import { Handle } from '@repo/layout'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import {
    PrioritySelect,
    TeamAssigneeSelect,
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
    TicketInfobarNavigation,
    TicketLayout,
    TicketLayoutContent,
    TicketTitle,
    TicketTitleSubject,
    UserAssigneeSelect,
} from '@repo/tickets'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import useDraftTicketActivityTracking from 'pages/tickets/detail/hooks/useDraftTicketActivityTracking'
import { useTicketInfobarSectionFlags } from 'pages/tickets/detail/TicketCustomerSections/useTicketInfobarSectionFlags'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'
import { NewTicketPageContent } from 'tickets/pages/NewTicketPage/components/NewTicketPageContent/NewTicketPageContent'
import { NewTicketPageInfobar } from 'tickets/pages/NewTicketPage/components/NewTicketPageInfobar'
import {
    NewTicketPageInfobarNavigationPanel,
    NewTicketPageInfobarPanel,
    NewTicketPageTicketDetailPanel,
} from 'tickets/pages/NewTicketPage/components/NewTicketPagePanels'
import { useNewTicketPageForm } from 'tickets/pages/NewTicketPage/hooks/useNewTicketForm'
import { useNewTicketPageSync } from 'tickets/pages/NewTicketPage/hooks/useNewTicketPageSync'

export function NewTicketPage() {
    const { onChangeTab } = useTicketInfobarNavigation()
    const isMessageDraftInitialized = useNewTicketPageSync()
    const {
        ticketState,
        handleSubjectChange,
        handlePriorityChange,
        handleUserChange,
        handleTeamChange,
        handleTagsChange,
        handleRecipientsChange,
        handleCustomerChange,
        submit,
        temporaryId,
    } = useNewTicketPageForm({ isMessageDraftInitialized })

    useDraftTicketActivityTracking(temporaryId)
    useEffect(() => {
        onChangeTab(TicketInfobarTab.Customer)
    }, [onChangeTab])

    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify,
    )
    const hasCustomer = Boolean(ticketState.customer)
    const sectionFlags = useTicketInfobarSectionFlags()

    return (
        <TicketLayout>
            <TicketHeaderContainer>
                <TicketHeaderLeft>
                    <TicketTitle>
                        <TicketTitleSubject
                            placeholder="New ticket"
                            value={ticketState.subject}
                            onChange={handleSubjectChange}
                            autoFocus
                        />
                    </TicketTitle>
                </TicketHeaderLeft>
                <TicketHeaderRight>
                    <PrioritySelect
                        value={ticketState.priority}
                        onChange={handlePriorityChange}
                    />
                    <UserAssigneeSelect
                        value={ticketState.assigneeUser}
                        onChange={handleUserChange}
                    />
                    <TeamAssigneeSelect
                        value={ticketState.assigneeTeam}
                        onChange={handleTeamChange}
                    />
                </TicketHeaderRight>
            </TicketHeaderContainer>
            <TicketLayoutContent>
                <NewTicketPageTicketDetailPanel>
                    <NewTicketPageContent
                        submit={submit}
                        subject={ticketState.subject}
                        onRecipientsChange={handleRecipientsChange}
                    />
                </NewTicketPageTicketDetailPanel>
                <Handle />
                <NewTicketPageInfobarPanel>
                    <NewTicketPageInfobar
                        tags={ticketState.tags}
                        onTagsChange={handleTagsChange}
                        onCustomerChange={handleCustomerChange}
                        customer={
                            ticketState.customer as unknown as TicketCustomer
                        }
                    />
                </NewTicketPageInfobarPanel>
                <NewTicketPageInfobarNavigationPanel>
                    <TicketInfobarNavigation
                        hasAutoQA={false}
                        hasShopify={hasCustomer && hasShopifyIntegration}
                        hasRecharge={hasCustomer && sectionFlags.hasRecharge}
                        hasBigCommerce={
                            hasCustomer && sectionFlags.hasBigCommerce
                        }
                        hasMagento={hasCustomer && sectionFlags.hasMagento}
                        hasWooCommerce={
                            hasCustomer && sectionFlags.hasWooCommerce
                        }
                        hasSmile={hasCustomer && sectionFlags.hasSmile}
                        hasYotpo={hasCustomer && sectionFlags.hasYotpo}
                        hasCustomIntegrations={
                            hasCustomer && sectionFlags.hasCustomIntegrations
                        }
                        hideWidgetEditing
                    />
                </NewTicketPageInfobarNavigationPanel>
            </TicketLayoutContent>
        </TicketLayout>
    )
}
