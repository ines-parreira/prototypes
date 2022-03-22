import React, {useMemo, useState} from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
    Form,
    Label,
    FormGroup,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {EditorState} from 'draft-js'
import classNames from 'classnames'
import {fromJS} from 'immutable'

import {getHasAutomationAddOn} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import SelfServicePreferencesNavbar from 'pages/settings/selfService/components/SelfServicePreferencesNavbar'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import history from 'pages/history'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/InputField'
import RichField from 'pages/common/forms/RichField/RichField'
import Tooltip from 'pages/common/components/Tooltip'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import {convertToHTML} from 'utils/editor'

import SelfServicePreview from '../QuickResponseFlowsPreferences/components/SelfServicePreview'
import css from './QuickResponseFlowItem.less'

type Props = {
    handleSubmit: ({
        buttonLabel,
        responseText,
    }: {
        buttonLabel: string
        responseText: {message: Map<any, any>}
    }) => void
    initialValue?: {buttonLabel: string; responseText: {message: Map<any, any>}}
    handleDelete?: () => void
}

const QuickResponseFlowItem = ({
    handleSubmit,
    initialValue,
    handleDelete,
}: Props) => {
    const configuration = useConfigurationData()
    const [buttonLabel, setButtonLabel] = useState(
        initialValue ? initialValue.buttonLabel : ''
    )
    const [responseText, setResponseText] = useState<{message: Map<any, any>}>(
        initialValue ? initialValue.responseText : {message: fromJS({})}
    )
    const [error, setError] = useState('')

    const baseURL = `/app/settings/self-service/shopify/${
        configuration.integration.getIn(['meta', 'shop_name']) as string
    }/preferences/quick-response`

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const quickResponses = useMemo(() => {
        return configuration.configuration?.quick_response_policies || []
    }, [configuration])

    if (!hasAutomationAddOn) {
        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    const handleButtonLabelChange = (value: string) => {
        setButtonLabel(value)
        setError('')
    }

    const handleSubmitWrapper = (event: React.FormEvent) => {
        event.preventDefault()

        const flowWithTheSameTitle = quickResponses.find(
            (response) => response.title === buttonLabel
        )

        if (flowWithTheSameTitle) {
            setError('Flow with the same title already exists')
            return
        }

        handleSubmit({buttonLabel, responseText})
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {configuration.integration.getIn([
                                'meta',
                                'shop_name',
                            ])}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col data-testid="configurationColumn">
                        <Button
                            onClick={() => history.push(baseURL)}
                            className={css.backButton}
                        >
                            <ButtonIconLabel icon="arrow_back">
                                {initialValue ? 'Edit Flow' : 'New Flow'}
                            </ButtonIconLabel>
                        </Button>

                        <Form
                            id="quickResponseForm"
                            onSubmit={handleSubmitWrapper}
                        >
                            <InputField
                                name="buttonLabel"
                                label="Button label"
                                placeholder="Ex. Product information"
                                required
                                value={buttonLabel}
                                onChange={handleButtonLabelChange}
                                maxLength={50}
                                autoFocus
                                error={error}
                                help={
                                    !error
                                        ? `${buttonLabel.length}/50 characters`
                                        : undefined
                                }
                                className={css.buttonLabel}
                            />

                            <FormGroup className={css.responseText}>
                                <Label
                                    for="responseText"
                                    className="control-label"
                                >
                                    What response should be sent?
                                    <i
                                        id="response-text-toggle-info"
                                        className={classNames(
                                            'material-icons',
                                            css.tooltipIcon
                                        )}
                                    >
                                        info_outline
                                    </i>
                                    <Tooltip
                                        placement="top-start"
                                        target="response-text-toggle-info"
                                        style={{
                                            textAlign: 'start',
                                            width: 164,
                                        }}
                                    >
                                        This response will be automatically
                                        provided to shoppers when they select
                                        this option in the quick answers section
                                    </Tooltip>
                                </Label>
                                <RichField
                                    value={{
                                        html: responseText.message.get('html'),
                                    }}
                                    onChange={(value: EditorState) => {
                                        const content =
                                            value.getCurrentContent()

                                        setResponseText((state) => ({
                                            ...state,
                                            message: state.message
                                                .set(
                                                    'html',
                                                    convertToHTML(content)
                                                )
                                                .set(
                                                    'text',
                                                    content.getPlainText()
                                                ),
                                        }))
                                    }}
                                    placeholder="Ex: Please more information about our product line in this article!"
                                />
                            </FormGroup>
                            <div
                                className={
                                    initialValue
                                        ? css.spreadButtons
                                        : css.joinedButtons
                                }
                            >
                                <Button
                                    type="submit"
                                    form="quickResponseForm"
                                    isDisabled={
                                        !!error || buttonLabel.length === 0
                                    }
                                >
                                    {initialValue
                                        ? 'Save Changes'
                                        : 'Create Flow'}
                                </Button>
                                {initialValue === undefined ? (
                                    <Button
                                        intent={
                                            initialValue
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        color={
                                            initialValue
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        onClick={() => {
                                            history.push(baseURL)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <ConfirmButton
                                        id="delete-flow"
                                        intent="destructive"
                                        confirmationContent={
                                            <span>
                                                Are you sure you want to delete
                                                this quick response flow?
                                            </span>
                                        }
                                        onConfirm={() => {
                                            handleDelete && handleDelete()
                                            history.push(baseURL)
                                        }}
                                    >
                                        Delete Flow
                                    </ConfirmButton>
                                )}
                            </div>
                        </Form>
                    </Col>

                    {/* TODO: update preview design */}
                    <Col data-testid="previewColumn" className={css.preview}>
                        <SelfServicePreview />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default QuickResponseFlowItem
