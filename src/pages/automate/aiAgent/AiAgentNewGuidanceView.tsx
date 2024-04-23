import React, {useState} from 'react'
import {notify} from 'reapop'
import BackLink from 'pages/common/components/BackLink/BackLink'
import InputField from 'pages/common/forms/input/InputField'
import history from 'pages/history'
import Button from 'pages/common/components/button/Button'
import {HelpCenter} from 'models/helpCenter/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import css from './AiAgentNewGuidanceView.less'
import {GuidanceEditor} from './components/GuidanceEditor/GuidanceEditor'
import {useGuidanceArticles} from './hooks/useGuidanceArticles'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'

type Props = {
    shopName: string
    helpCenter: HelpCenter
}

export const AiAgentNewGuidanceView = ({shopName, helpCenter}: Props) => {
    const dispatch = useAppDispatch()
    const {createOrUpdateGuidanceArticle, isGuidanceArticleUpdating} =
        useGuidanceArticles(helpCenter.id)
    const {routes} = useAiAgentNavigation({shopName})
    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const onNameChange = (value: string) => {
        setName(value)
    }
    const onContentChange = (value: string) => {
        setContent(value)
    }

    const isSubmitDisabled = !name || !content
    const onSubmit = async () => {
        try {
            await createOrUpdateGuidanceArticle({
                title: name,
                content,
                locale: helpCenter.default_locale,
                visibility: 'PUBLIC',
            })
        } catch (e) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article creation.',
                })
            )
        }

        history.push(routes.guidance)
    }

    const onSaveAndTest = async () => {
        await createOrUpdateGuidanceArticle({
            title: name,
            content,
            locale: helpCenter.default_locale,
            visibility: 'PUBLIC',
        })

        history.push(routes.playground)
    }

    const onCancel = () => {
        history.push(routes.guidance)
    }

    return (
        <>
            <div className={css.container}>
                <div className={css.content}>
                    <BackLink path={routes.guidance} label="Back to Guidance" />

                    <InputField
                        label="Guidance name"
                        isRequired
                        placeholder="e.g. Order questions without data"
                        caption="AI Agent uses this to help find relevant guidance"
                        onChange={onNameChange}
                        name="name"
                        value={name}
                    />
                    <GuidanceEditor
                        onChange={onContentChange}
                        label="Instructions"
                        value={content}
                        placeholder="e.g. If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address."
                        maxChars={1000}
                        height={320}
                    />
                </div>

                <div className={css.btnGroup}>
                    <Button
                        isDisabled={isSubmitDisabled}
                        isLoading={isGuidanceArticleUpdating}
                        onClick={onSubmit}
                    >
                        Create Guidance
                    </Button>
                    <Button
                        isDisabled={isSubmitDisabled}
                        isLoading={isGuidanceArticleUpdating}
                        onClick={onSaveAndTest}
                    >
                        Save and test
                    </Button>

                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className={css.alertContainer}>
                <Alert type={AlertType.Info} icon className={css.alert}>
                    <p>
                        Give your AI Agent instructions on how to handle
                        specific situations.
                    </p>
                    <p>
                        Instructions can be context specific, for example:{' '}
                        <b>
                            “For pricing questions, point them to our pricing
                            page: https://example.com/pricing”
                        </b>
                    </p>
                    <p>
                        Instructions can also be general:{' '}
                        <b>
                            “Always end by asking if they need more help, no
                            matter what they asked.”
                        </b>
                    </p>
                </Alert>
            </div>
        </>
    )
}
