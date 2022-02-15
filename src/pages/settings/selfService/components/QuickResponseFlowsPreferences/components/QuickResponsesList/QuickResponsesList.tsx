import React, {useState, useMemo} from 'react'
import {useLatest} from 'react-use'
import {
    Table,
    Button,
    Form,
    FormGroup,
    FormText,
    Label,
    Input,
} from 'reactstrap'
import {produce} from 'immer'

import Modal from 'pages/common/components/Modal'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'

import {useConfigurationData} from '../../../hooks'
import {updateSelfServiceConfiguration} from '../../../../../../../models/selfServiceConfiguration/resources'
import {QuickReplyPolicy} from '../../../../../../../models/selfServiceConfiguration/types'
import {selfServiceConfigurationUpdated} from '../../../../../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../../../state/notifications/types'
import useAppDispatch from '../../../../../../../hooks/useAppDispatch'

import QuickResponseListItem from '../QuickResponseListItem'
import css from './QuickResponsesList.less'

const QuickResponsesList = () => {
    const [shouldShowModal, setShouldShowModal] = useState(false)
    const [title, setTitle] = useState('')
    const [quickResponseIndex, setQuickResponseIndex] = useState<number | null>(
        null
    )
    const [error, setError] = useState('')
    const dispatch = useAppDispatch()
    const configuration = useConfigurationData()

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    // handleDragAndDrop is not updated inside ReactSortable between renders
    // So we access the latest quick responses array via this hook
    const latestQuickResponsesWithIds = useLatest(quickResponses)

    const handleAddFlow = () => {
        setTitle('')
        setQuickResponseIndex(null)
        setShouldShowModal(true)
        setError('')
    }

    const handleClose = () => {
        setShouldShowModal(false)
        setTitle('')
        setError('')
    }

    const updateQuickReplyPolicies = async (
        newQuickRepliesPolicy: QuickReplyPolicy[]
    ) => {
        if (!configuration || !configuration.configuration?.id) {
            throw new Error('id is not present in self service configuration')
        }

        const newConfiguration = {
            ...configuration.configuration,
            quick_response_policies: newQuickRepliesPolicy,
        }

        try {
            const res = await updateSelfServiceConfiguration(newConfiguration)
            void dispatch(selfServiceConfigurationUpdated(res))
            void (await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Flow successfully updated',
                })
            ))
        } catch (error) {
            void (await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not update flow, please try again later',
                })
            ))
        }
    }

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
        const title = quickResponses[position].title
        setTitle(title)
        setQuickResponseIndex(position)
        setShouldShowModal(true)
    }

    const handleDeleteEntity = (position: number) => () => {
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                quickResponsesDraft.splice(position, 1)
            }
        )

        void updateQuickReplyPolicies(newQuickResponses)
    }

    const handleToggleClick = (position: number) => () => {
        const newQuickResponses = produce(
            quickResponses,
            (quickResponsesDraft) => {
                if (quickResponses[position].deactivated_datetime) {
                    quickResponsesDraft[position].deactivated_datetime = null
                } else {
                    quickResponsesDraft[position].deactivated_datetime =
                        new Date().toISOString()
                }
            }
        )

        void updateQuickReplyPolicies(newQuickResponses)
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

            <Button color="primary" onClick={handleAddFlow}>
                <span className="material-icons">add</span>
                Add flow
            </Button>

            <Modal
                autoFocus={false}
                centered
                header={quickResponseIndex ? `Edit flow` : `Add flow`}
                isOpen={shouldShowModal}
                onClose={handleClose}
                footerClassName={css.modalButtons}
                footer={
                    <>
                        <Button
                            color="secondary"
                            type="button"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            form="quickResponseForm"
                            disabled={!!error}
                        >
                            {quickResponseIndex ? `Save changes` : `Add flow`}
                        </Button>
                    </>
                }
            >
                <Form id="quickResponseForm" onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label for="flowTitle">Flow title</Label>
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

export default QuickResponsesList
