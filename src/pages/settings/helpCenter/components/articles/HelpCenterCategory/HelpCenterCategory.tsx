import classNames from 'classnames'
import React from 'react'
import {
    Input,
    Label,
    Button,
    FormGroup,
    FormText,
    InputGroupAddon,
    InputGroup,
} from 'reactstrap'

import {HelpCenter, LocaleCode} from '../../../../../../models/helpCenter/types'

import {Drawer} from '../../../../../common/components/Drawer'

import {
    HELP_CENTER_DOMAIN,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../../../constants'
import {slugify} from '../../../utils/helpCenter.utils'

import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import {useLocaleSelectOptions} from '../../../hooks/useLocaleSelectOptions'

import {ArticleLanguageSelect} from '../ArticleLanguageSelect'

import css from './HelpCenterCategory.less'

type Props = {
    isOpen: boolean
    helpCenter: HelpCenter | null
    getCategory: () => Promise<unknown>
    onClose: () => void
}

export const HelpCenterCategory = ({
    isOpen,
    helpCenter,
    getCategory,
    onClose,
}: Props): JSX.Element => {
    const [isLoading, setLoading] = React.useState(true)
    const [title, setTitle] = React.useState('')
    const [slug, setSlug] = React.useState('')
    const [isPristineSlug, setPristineSlug] = React.useState(true)
    const [description, setDescription] = React.useState('')
    const [currentLocale, setCurrentLocale] = React.useState(
        HELP_CENTER_LANGUAGE_DEFAULT
    )

    React.useEffect(() => {
        if (isOpen) {
            getCategory()
                .then(() => {
                    setLoading(false)
                })
                .catch((err) => {
                    throw err
                })
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setCurrentLocale(HELP_CENTER_LANGUAGE_DEFAULT)
        }
    }, [isOpen])

    const handleChangeTitle = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(ev.target.value)

        if (isPristineSlug) {
            setSlug(slugify(ev.target.value))
        }
    }

    const handleChangeSlug = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(slugify(ev.target.value))

        if (isPristineSlug) {
            setPristineSlug(false)
        }
    }

    const handleChangeDescription = (
        ev: React.ChangeEvent<HTMLInputElement>
    ) => {
        setDescription(ev.target.value)
    }

    // TODO: add the helpcenter.supported_languages
    const options = useLocaleSelectOptions(getLocalesResponseFixture, [
        (helpCenter?.default_locale as LocaleCode) ||
            HELP_CENTER_LANGUAGE_DEFAULT,
        'fr-FR',
        'de-DE',
        'es-ES',
    ])

    const content = () => (
        <>
            <Drawer.Header>
                <span className={css.title}>Category Settings</span>
                <Drawer.HeaderActions>
                    <ArticleLanguageSelect
                        selected={currentLocale}
                        list={options}
                        onSelect={(_, value) => setCurrentLocale(value)}
                    />
                    <button
                        type="button"
                        data-testid="close-drawer"
                        aria-label="close modal"
                        className={css['close-btn']}
                        onClick={onClose}
                    >
                        <i className="material-icons">keyboard_tab</i>
                    </button>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <Label for="title">Title</Label>
                    <Input
                        data-testid="title-input"
                        autoFocus
                        name="title"
                        id="title"
                        value={title}
                        placeholder="Category title"
                        onChange={handleChangeTitle}
                    />
                </FormGroup>
                <FormGroup className={classNames(css.textfield, css.required)}>
                    <Label for="slug">Slug</Label>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <span
                                data-testid="slug-domain"
                                className={css['slug-domain']}
                            >
                                {`https://${
                                    helpCenter?.subdomain as string
                                }.${HELP_CENTER_DOMAIN}/${currentLocale.toLowerCase()}`}
                            </span>
                        </InputGroupAddon>
                        <Input
                            data-testid="slug-input"
                            name="slug"
                            id="slug"
                            value={slug}
                            placeholder="Category slug"
                            onChange={handleChangeSlug}
                        />
                    </InputGroup>
                    <FormText>This is your category’s link.</FormText>
                </FormGroup>
                <FormGroup className={css.textfield}>
                    <Label for="description">Description</Label>
                    <Input
                        name="description"
                        id="description"
                        type="textarea"
                        placeholder="Category description"
                        value={description}
                        style={{
                            resize: 'vertical',
                            minHeight: 52,
                        }}
                        onChange={handleChangeDescription}
                    />
                    <FormText>
                        Category description is displayed in search engines to
                        help people find it.
                    </FormText>
                </FormGroup>
            </Drawer.Content>
            <Drawer.Footer>
                <Button
                    data-testid="button-save"
                    color="primary"
                    disabled={Boolean(title === '' || slug === '')}
                >
                    Save
                </Button>
            </Drawer.Footer>
        </>
    )

    return (
        <Drawer
            name="category-edit"
            open={isOpen}
            fullscreen={false}
            isLoading={isLoading}
            portalRootId="app-root"
        >
            {content()}
        </Drawer>
    )
}
