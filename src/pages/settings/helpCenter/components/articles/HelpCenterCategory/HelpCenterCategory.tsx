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

import {
    HelpCenter,
    CategoryTranslation,
    Category,
    LocaleCode,
    CreateCategoryDto,
} from '../../../../../../models/helpCenter/types'

import {Drawer} from '../../../../../common/components/Drawer'

import {
    HELP_CENTER_DOMAIN,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../../../constants'
import {slugify} from '../../../utils/helpCenter.utils'

import css from './HelpCenterCategory.less'

type Props = {
    isOpen: boolean
    isCreate?: boolean
    isLoading: boolean
    helpCenter: HelpCenter | null
    category: Category | null
    onCreate?: (payload: CreateCategoryDto) => void
    onSave?: (payload: Partial<CategoryTranslation>, locale: LocaleCode) => void
    onClose: () => void
    onDelete?: (categoryId: number) => void
}

export const HelpCenterCategory = ({
    isOpen,
    isCreate,
    isLoading,
    category,
    helpCenter,
    onSave,
    onCreate,
    onClose,
    onDelete,
}: Props): JSX.Element => {
    const [title, setTitle] = React.useState(category?.translation?.title || '')
    const [slug, setSlug] = React.useState(category?.translation?.slug || '')
    const [isPristineSlug, setPristineSlug] = React.useState(true)
    const [description, setDescription] = React.useState(
        category?.translation?.description || ''
    )
    const [currentLocale, setCurrentLocale] = React.useState(
        category?.translation?.locale || HELP_CENTER_LANGUAGE_DEFAULT
    )

    React.useEffect(() => {
        if (isOpen) {
            setTitle(category?.translation?.title || '')
            setSlug(category?.translation?.slug || '')
            setDescription(category?.translation?.description || '')
            setCurrentLocale(
                category?.translation?.locale || HELP_CENTER_LANGUAGE_DEFAULT
            )
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setCurrentLocale(HELP_CENTER_LANGUAGE_DEFAULT)
        }
    }, [isOpen, category])

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

    const handleOnSave = () => {
        if (isCreate) {
            onCreate &&
                onCreate({
                    translation: {
                        title,
                        slug,
                        description,
                        locale: currentLocale,
                    },
                })
            return
        }
        onSave &&
            onSave(
                {
                    title,
                    slug,
                    description,
                },
                currentLocale
            )
    }

    // const options = useLocaleSelectOptions(getLocalesResponseFixture, [
    //     helpCenter?.default_locale || HELP_CENTER_LANGUAGE_DEFAULT,
    // ])

    const content = () => (
        <>
            <Drawer.Header>
                <span className={css.title}>Category Settings</span>
                <Drawer.HeaderActions>
                    {
                        // TODO: Uncomment this when we support locales
                        /* <ArticleLanguageSelect
                        selected={currentLocale}
                        list={options}
                        onSelect={(_, value) =>
                            setCurrentLocale(value as LocaleCode)
                        }
                    /> */
                    }
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
                <FormGroup className={classNames(css.textfield, css.required)}>
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
                    disabled={Boolean(
                        title.trim() === '' ||
                            slug.trim() === '' ||
                            description.trim() === ''
                    )}
                    onClick={handleOnSave}
                >
                    Save
                </Button>
                {category?.id && onDelete && (
                    <Button
                        className={css['delete-btn']}
                        onClick={() => onDelete(category.id)}
                    >
                        <i className="material-icons mr-2">delete</i>
                        Delete
                    </Button>
                )}
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
