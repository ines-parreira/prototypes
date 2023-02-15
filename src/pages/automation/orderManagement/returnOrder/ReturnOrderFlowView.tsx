import React, {useRef, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Container, Breadcrumb, BreadcrumbItem} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceConfigurationFilter} from 'models/selfServiceConfiguration/types'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import ReturnOrderEligibility from './components/ReturnOrderEligibility'

import css from './ReturnOrderFlowView.less'

const ReturnOrderFlowView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const returnOrderFlow = selfServiceConfiguration?.return_order_policy

    const [dirtyReturnOrderFlow, setDirtyReturnOrderFlow] =
        useState(returnOrderFlow)
    const previousReturnOrderFlow = useRef(returnOrderFlow)

    if (previousReturnOrderFlow.current !== returnOrderFlow) {
        previousReturnOrderFlow.current = returnOrderFlow

        setDirtyReturnOrderFlow(returnOrderFlow)
    }

    const handleEligibilityChange = (
        eligibility?: SelfServiceConfigurationFilter
    ) => {
        if (!dirtyReturnOrderFlow) {
            return
        }

        setDirtyReturnOrderFlow({
            ...dirtyReturnOrderFlow,
            eligibilities: eligibility ? [eligibility] : [],
        })
    }
    const handleSubmit = () => {
        if (!selfServiceConfiguration || !dirtyReturnOrderFlow) {
            return
        }

        void handleSelfServiceConfigurationUpdate({
            ...selfServiceConfiguration,
            return_order_policy: dirtyReturnOrderFlow,
        })
    }
    const handleCancel = () => {
        setDirtyReturnOrderFlow(returnOrderFlow)
    }

    const isReturnOrderFlowDirty = !_isEqual(
        dirtyReturnOrderFlow,
        returnOrderFlow
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management`}
                            >
                                Order management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Return order</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(selfServiceConfiguration),
                })}
            >
                {!selfServiceConfiguration ? (
                    <Loader />
                ) : (
                    <div>
                        <div className={css.descriptionContainer}>
                            <p className="mb-1">
                                Allow customers to request a return if an order
                                has been delivered.
                            </p>
                            <a
                                href="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                Learn About Order Statuses In Gorgias
                            </a>
                        </div>

                        <ReturnOrderEligibility
                            eligibility={dirtyReturnOrderFlow?.eligibilities[0]}
                            onChange={handleEligibilityChange}
                        />

                        <div className={css.submitAndCancelButtonsContainer}>
                            <Button
                                isDisabled={
                                    !isReturnOrderFlowDirty || isUpdatePending
                                }
                                onClick={handleSubmit}
                            >
                                Save changes
                            </Button>
                            <Button
                                isDisabled={
                                    !isReturnOrderFlowDirty || isUpdatePending
                                }
                                onClick={handleCancel}
                                intent="secondary"
                            >
                                Cancel
                            </Button>
                        </div>
                        <UnsavedChangesPrompt
                            onSave={handleSubmit}
                            when={isReturnOrderFlowDirty && !isUpdatePending}
                        />
                    </div>
                )}
            </Container>
        </div>
    )
}

export default ReturnOrderFlowView
