import React, {useState, useMemo} from 'react'
import {useLatest} from 'react-use'
import {Table, Form, FormGroup, FormText, Label, Input} from 'reactstrap'
import {produce} from 'immer'
import {List} from 'immutable'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/Modal'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'
import history from 'pages/history'
import {isProduction} from 'utils/environment'

import {useConfigurationData} from '../../../hooks'
import {QuickReplyPolicy} from '../../../../../../../models/selfServiceConfiguration/types'
import {useUpdateQuickReplyPolicies} from '../../../QuickResponseFlowItem/hooks'

import QuickResponseListItem from '../QuickResponseListItem'
import css from './QuickResponseList.less'

const QuickResponseList = () => {
    const [shouldShowModal, setShouldShowModal] = useState(false)
    const [title, setTitle] = useState('')
    const [quickResponseIndex, setQuickResponseIndex] = useState<number | null>(
        null
    )
    const [error, setError] = useState('')
    const configuration = useConfigurationData()
    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response/`

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    // handleDragAndDrop is not updated inside ReactSortable between renders
    // So we access the latest quick responses array via this hook
    const latestQuickResponsesWithIds = useLatest(quickResponses)

    const handleAddFlow = () => {
        if (!isProduction()) {
            history.push(baseURL.concat('new'))
        } else {
            setTitle('')
            setQuickResponseIndex(null)
            setShouldShowModal(true)
            setError('')
        }
    }

    const handleClose = () => {
        setShouldShowModal(false)
        setTitle('')
        setError('')
    }

    const {updateQuickReplyPolicies} = useUpdateQuickReplyPolicies()

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
        setError('')
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        const flowWithTheSameTitle = quickResponses.find(
            (response) => response.title === title
        )
        if (flowWithTheSameTitle) {
            setError('Flow with the same title already exists')
            return
        }

        let newQuickResponses
        if (quickResponseIndex === null) {
            const deactivatedDatetime = isLimitReached
                ? new Date().toISOString()
                : null
            newQuickResponses = produce(
                quickResponses,
                (quickResponsesDraft) => {
                    quickResponsesDraft.push({
                        title,
                        deactivated_datetime: deactivatedDatetime,
                        response_message_content: {
                            html: '<div><br></div>',
                            text: '',
                            attachments: List(),
                        },
                    })
                }
            )
        } else {
            newQuickResponses = produce(
                quickResponses,
                (quickResponsesDraft) => {
                    quickResponsesDraft[quickResponseIndex].title = title
                }
            )
        }

        void updateQuickReplyPolicies(newQuickResponses)
        setShouldShowModal(false)
    }

    const handleEditClick = (position: number) => () => {
        if (!isProduction()) {
            const id = quickResponses[position].id
            history.push(baseURL.concat(id ?? ''))
        } else {
            const title = quickResponses[position].title
            setTitle(title)
            setQuickResponseIndex(position)
            setShouldShowModal(true)
        }
    }

    const handleDeleteEntity = (position: number) => async () => {
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                quickResponsesDraft.splice(position, 1)
            }
        )

        await updateQuickReplyPolicies(newQuickResponses)
        logEvent(SegmentEvent.QuickResponseFlowDeleted, {
            id: quickResponses[position].id,
        })
    }

    const handleToggleClick = (position: number) => async () => {
        let type = SegmentEvent.QuickResponseFlowActivated
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                if (quickResponses[position].deactivated_datetime) {
                    quickResponsesDraft[position].deactivated_datetime = null
                } else {
                    quickResponsesDraft[position].deactivated_datetime =
                        new Date().toISOString()
                    type = SegmentEvent.QuickResponseFlowDeactivated
                }
            }
        )

        await updateQuickReplyPolicies(newQuickResponses)
        logEvent(type, {
            id: quickResponses[position].id,
        })
    }

    const handleDragAndDrop = (sortedIds: string[]) => {
        const sortedResponsePolicies = sortedIds.map((id) => {
            const foundResponse = latestQuickResponsesWithIds.current.find(
                (response) => response.title === id
            )
            return foundResponse
        }) as QuickReplyPolicy[]

        void updateQuickReplyPolicies(sortedResponsePolicies)
    }

    const numberOfActiveFlows = useMemo(() => {
        return quickResponses.filter(
            (response) => !response.deactivated_datetime
        ).length
    }, [quickResponses])

    const isLimitReached = numberOfActiveFlows >= 4

    return (
        <>
            {quickResponses.length > 0 && (
                <Table className={css.table}>
                    <thead>
                        <tr>
                            <th style={{width: 25}} />
                            <th style={{width: 25}} />
                            <th />
                            <th style={{width: 50}} />
                        </tr>
                    </thead>
                    <ReactSortable
                        tag="tbody"
                        options={{
                            draggable: '.draggable',
                            handle: '.drag-handle',
                            animation: 150,
                        }}
                        onChange={handleDragAndDrop}
                    >
                        {quickResponses.map((response, index) => (
                            <QuickResponseListItem
                                key={response.title}
                                title={response.title}
                                enabled={!response.deactivated_datetime}
                                isLimitReached={isLimitReached}
                                position={index}
                                onEditClick={handleEditClick(index)}
                                onDeleteConfirmation={handleDeleteEntity(index)}
                                onToggle={handleToggleClick(index)}
                            />
                        ))}
                    </ReactSortable>
                </Table>
            )}

            <Button onClick={handleAddFlow}>
                <span className="material-icons">add</span>
                Add flow
            </Button>

            <Modal
                autoFocus={false}
                centered
                header={quickResponseIndex !== null ? `Edit flow` : `Add flow`}
                isOpen={shouldShowModal}
                onClose={handleClose}
                footerClassName={css.modalButtons}
                footer={
                    <>
                        <Button
                            intent="secondary"
                            color="secondary"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="quickResponseForm"
                            isDisabled={!!error}
                        >
                            {quickResponseIndex ? `Save changes` : `Add flow`}
                        </Button>
                    </>
                }
            >
                <Form id="quickResponseForm" onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label for="flowTitle" className="control-label">
                            Flow title
                        </Label>
                        <Input
                            name="flowTitle"
                            id="flowTitle"
                            placeholder="Ex. Product information"
                            required
                            value={title}
                            maxLength={50}
                            onChange={handleTitleChange}
                            autoFocus
                        />
                        {error ? (
                            <FormText color="danger">{error}</FormText>
                        ) : (
                            <FormText color="muted">{title.length}/50</FormText>
                        )}
                    </FormGroup>
                </Form>
            </Modal>
        </>
    )
}

export default QuickResponseList
