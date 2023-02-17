import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceConfigurationFilter} from 'models/selfServiceConfiguration/types'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import CancelOrderEligibility from './components/CancelOrderEligibility'

import css from './CancelOrderFlowView.less'

const CancelOrderFlowView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const cancelOrderFlow = selfServiceConfiguration?.cancel_order_policy

    const [dirtyCancelOrderFlow, setDirtyCancelOrderFlow] =
        useState(cancelOrderFlow)

    useEffect(() => {
        setDirtyCancelOrderFlow(cancelOrderFlow)
    }, [cancelOrderFlow])

    const handleEligibilityChange = (
        eligibility?: SelfServiceConfigurationFilter
    ) => {
        if (!dirtyCancelOrderFlow) {
            return
        }

        setDirtyCancelOrderFlow({
            ...dirtyCancelOrderFlow,
            eligibilities: eligibility ? [eligibility] : [],
        })
    }
    const handleSubmit = () => {
        if (!selfServiceConfiguration || !dirtyCancelOrderFlow) {
            return
        }

        void handleSelfServiceConfigurationUpdate({
            ...selfServiceConfiguration,
            cancel_order_policy: dirtyCancelOrderFlow,
        })
    }
    const handleCancel = () => {
        setDirtyCancelOrderFlow(cancelOrderFlow)
    }

    const isCancelOrderFlowDirty = !_isEqual(
        dirtyCancelOrderFlow,
        cancelOrderFlow
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
                        <BreadcrumbItem active>Cancel order</BreadcrumbItem>
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
                                Allow customers to request a cancellation if an
                                order hasn't been processed or shipped.
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

                        <CancelOrderEligibility
                            eligibility={dirtyCancelOrderFlow?.eligibilities[0]}
                            onChange={handleEligibilityChange}
                        />

                        <div className={css.submitAndCancelButtonsContainer}>
                            <Button
                                isDisabled={
                                    !isCancelOrderFlowDirty || isUpdatePending
                                }
                                onClick={handleSubmit}
                            >
                                Save changes
                            </Button>
                            <Button
                                isDisabled={
                                    !isCancelOrderFlowDirty || isUpdatePending
                                }
                                onClick={handleCancel}
                                intent="secondary"
                            >
                                Cancel
                            </Button>
                        </div>
                        <UnsavedChangesPrompt
                            onSave={handleSubmit}
                            when={isCancelOrderFlowDirty && !isUpdatePending}
                        />
                    </div>
                )}
            </Container>
        </div>
    )
}

export default CancelOrderFlowView
