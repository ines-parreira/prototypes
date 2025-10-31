import React, {
    ChangeEvent,
    Component,
    ComponentType,
    KeyboardEvent,
    ReactNode,
} from 'react'

import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import GorgiasApi, { SearchResultType } from 'services/gorgiasApi'

import { SearchInputResultProps, SearchInputSubResultProps } from './types'
import { getSearchResultUniqueId } from './utils'

import css from './SearchInput.less'

export type Props<ResultType, SubResultType> = {
    endpoint: string
    autoFocus?: boolean
    searchOnFocus?: boolean
    className?: string
    placeholder?: string
    renderResult: ComponentType<SearchInputResultProps<ResultType>>
    renderSubResult?: ComponentType<
        SearchInputSubResultProps<ResultType, SubResultType>
    >
    onResultClicked: (result: ResultType) => Array<SubResultType> | void
    onSubResultClicked: (result: ResultType, subResult: SubResultType) => void
    resultLabel: string
    resultLabelPlural: string
    subResultLabel: string
    subResultLabelPlural: string
    hasError?: boolean
    renderResultsAppendix?: (props: {
        onMouseOver: () => void
        onMouseClick: () => void
    }) => JSX.Element | ConcatArray<JSX.Element>
    renderResultItemProps?: (props: SearchInputResultProps<ResultType>) => {
        disabled?: boolean
        disabledReason?: string
    }
}

type State<ResultType extends SearchResultType, SubResultType> = {
    filter: string
    isLoading: boolean
    isOpen: boolean
    results: ResultType[]
    subResults: Array<SubResultType>
    clickedResult: ResultType | null
    hoveredIndex: number
}

export default class SearchInput<
    ResultType extends SearchResultType,
    SubResultType extends SearchResultType,
> extends Component<
    Props<ResultType, SubResultType>,
    State<ResultType, SubResultType>
> {
    static defaultProps = {
        autoFocus: true,
        searchOnFocus: false,
        placeholder: 'Search...',
        onResultClicked: _noop,
        onSubResultClicked: _noop,
        resultLabel: 'result',
        resultLabelPlural: 'results',
        subResultLabel: 'sub result',
        subResultLabelPlural: 'sub results',
        hasError: false,
    }

    state: State<ResultType, SubResultType> = {
        filter: '',
        isLoading: false,
        isOpen: false,
        results: [],
        subResults: [],
        clickedResult: null,
        hoveredIndex: -1,
    }

    _inputElement?: HTMLInputElement
    _gorgiasApi = new GorgiasApi()

    componentDidMount() {
        const { autoFocus } = this.props

        if (autoFocus && this._inputElement) {
            setTimeout(() => this._inputElement?.focus(), 0)
        }

        void this._fetchResults('')
    }

    componentWillUnmount() {
        this._gorgiasApi.cancelPendingRequests()
    }

    _saveInputRef = (inputRef: HTMLInputElement) => {
        this._inputElement = inputRef
    }

    _toggle = () => {
        const { isOpen } = this.state
        this.setState({ isOpen: !isOpen })
    }

    _onChange = (value: string) => {
        this.setState({
            filter: value,
            isOpen: true,
            hoveredIndex: -1,
        })
        void this._fetchResults(value)
    }

    _onKeyDown = (event: KeyboardEvent) => {
        const { results, subResults } = this.state
        const items = subResults.length ? subResults : results

        switch (event.key) {
            case 'ArrowDown': {
                const { hoveredIndex: currentIndex } = this.state

                let newIndex = currentIndex + 1
                if (newIndex >= items.length) {
                    newIndex = 0
                }

                this.setState({ hoveredIndex: newIndex, isOpen: true })
                this._scrollToItem(newIndex)
                event.preventDefault()
                break
            }
            case 'ArrowUp': {
                const { hoveredIndex: currentIndex } = this.state

                let newIndex = currentIndex - 1
                if (newIndex < 0) {
                    newIndex = items.length - 1
                }

                this.setState({ hoveredIndex: newIndex, isOpen: true })
                this._scrollToItem(newIndex)
                event.preventDefault()
                break
            }
            case 'Enter': {
                const { hoveredIndex } = this.state

                if (hoveredIndex !== -1) {
                    if (subResults.length) {
                        this._onSubResultClicked(hoveredIndex)
                    } else {
                        this._onResultClicked(hoveredIndex)
                    }
                }
                break
            }
            case 'Escape': {
                if (subResults.length) {
                    this._onBackClicked()
                } else {
                    this.setState({ isOpen: false })
                }
                break
            }
            default:
                break
        }
    }

    _onFocus = (event: ChangeEvent<HTMLInputElement>) => {
        const filter = event.target.value
        const { searchOnFocus } = this.props
        const { results } = this.state

        if (searchOnFocus && !results.length) {
            void this._fetchResults(filter)
        }
    }

    _scrollToItem(index: number) {
        const dropdown = this._inputElement?.closest('.dropdown')
        if (!dropdown) {
            return
        }

        const dropdownMenu =
            dropdown.querySelector<HTMLDivElement>('.dropdown-menu')
        if (!dropdownMenu) {
            return
        }

        const item = dropdownMenu.querySelector<HTMLDivElement>(
            `.dropdown-item:nth-of-type(${index + 1})`,
        )
        if (!item) {
            return
        }

        const shouldScroll =
            item.offsetTop + item.offsetHeight > dropdownMenu.offsetHeight ||
            dropdownMenu.scrollTop > item.offsetTop

        if (shouldScroll) {
            const padding = 6
            dropdownMenu.scrollTop = index === 0 ? 0 : item.offsetTop - padding
        }
    }

    _fetchResults = _debounce(async (filter: string) => {
        try {
            this.setState({ isLoading: true })
            this._gorgiasApi.cancelPendingRequests(true)
            const { endpoint } = this.props
            const results = (await this._gorgiasApi.search(
                endpoint,
                filter,
            )) as ResultType[]
            this.setState({ results })
        } catch (error) {
            this.setState({ results: [] })
            console.error(error)
        } finally {
            this.setState({ isLoading: false })
        }
    }, 200)

    _onBackClicked = () => {
        this.setState({
            clickedResult: null,
            hoveredIndex: -1,
            subResults: [],
        })
    }

    _onResultClicked(index: number) {
        const { onResultClicked } = this.props
        const { results } = this.state
        const result = results[index]
        const subResults = onResultClicked(result) || []

        this.setState({
            clickedResult: result,
            hoveredIndex: -1,
            subResults,
            isOpen: subResults.length > 1,
        })
    }

    _onSubResultClicked(index: number) {
        const { onSubResultClicked } = this.props
        const { clickedResult, subResults } = this.state
        const subResult = subResults[index]

        this.setState({
            clickedResult: null,
            hoveredIndex: -1,
            subResults: [],
            isOpen: false,
        })

        if (clickedResult) {
            onSubResultClicked(clickedResult, subResult)
        }
    }

    _renderHeader() {
        const {
            resultLabel,
            resultLabelPlural,
            subResultLabel,
            subResultLabelPlural,
        } = this.props
        const { results, subResults } = this.state

        return (
            <DropdownItem header className={css.header}>
                {subResults.length ? (
                    <Button
                        className={classnames('mr-2', css.backButton)}
                        size="small"
                        intent="secondary"
                        onClick={this._onBackClicked}
                        leadingIcon="arrow_back"
                    >
                        Back
                    </Button>
                ) : null}

                {subResults.length
                    ? `${subResults.length} ${
                          subResults.length > 1
                              ? subResultLabelPlural
                              : subResultLabel
                      }`
                    : `${results.length} ${
                          results.length > 1 ? resultLabelPlural : resultLabel
                      }`}
            </DropdownItem>
        )
    }

    _renderResults = () => {
        const {
            renderResult: Result,
            renderResultsAppendix,
            renderResultItemProps,
        } = this.props
        const { results, hoveredIndex } = this.state

        let dropdownItems = results.length
            ? results.map((result, index) => {
                  const itemProps = renderResultItemProps?.({ result })
                  const disabled = itemProps?.disabled
                  const uniqueResultId = getSearchResultUniqueId(
                      result as unknown as { id: number; external_id?: string },
                  )

                  return (
                      <DropdownItem
                          key={uniqueResultId}
                          onMouseEnter={() =>
                              this.setState({ hoveredIndex: index })
                          }
                          onClick={() =>
                              !disabled
                                  ? this._onResultClicked(index)
                                  : undefined
                          }
                          className={classnames(css.dropdownItem, {
                              [css.hoveredDropdownItem]: hoveredIndex === index,
                          })}
                          toggle={false}
                          aria-disabled={disabled}
                          id={`dropdown-item-${uniqueResultId}`}
                      >
                          <Result result={result} />
                          {disabled ? (
                              <Tooltip
                                  target={`dropdown-item-${uniqueResultId}`}
                                  placement="top"
                                  className={css.tooltip}
                              >
                                  {itemProps?.disabledReason ??
                                      'This item cannot be selected.'}
                              </Tooltip>
                          ) : null}
                      </DropdownItem>
                  )
              })
            : []

        if (renderResultsAppendix) {
            dropdownItems = dropdownItems.concat(
                renderResultsAppendix({
                    onMouseOver: () => this.setState({ hoveredIndex: -1 }),
                    onMouseClick: () =>
                        this.setState({ ...this.state, isOpen: false }),
                }),
            )
        }

        return dropdownItems
    }

    _renderSubResults() {
        const { renderSubResult: SubResult } = this.props
        const { hoveredIndex, clickedResult, subResults } = this.state

        return subResults.length && clickedResult && SubResult
            ? subResults.map<ReactNode>((subResult: SubResultType, index) => (
                  <DropdownItem
                      key={`sub-result-${subResult.id}`}
                      onMouseEnter={() =>
                          this.setState({ hoveredIndex: index })
                      }
                      onClick={() => this._onSubResultClicked(index)}
                      className={classnames(css.dropdownItem, {
                          [css.hoveredDropdownItem]: hoveredIndex === index,
                      })}
                      toggle={true}
                  >
                      <SubResult result={clickedResult} subResult={subResult} />
                  </DropdownItem>
              ))
            : null
    }

    render() {
        const { className, placeholder, renderSubResult, hasError } = this.props
        const { filter, isLoading, isOpen, subResults } = this.state

        return (
            <Dropdown
                isOpen={isOpen}
                className={className}
                toggle={this._toggle}
            >
                <DropdownToggle
                    tag="div"
                    data-toggle="dropdown"
                    aria-expanded={isOpen}
                    className="input-icon input-icon-right"
                >
                    <TextInput
                        value={filter}
                        onChange={this._onChange}
                        onKeyDown={this._onKeyDown}
                        onFocus={this._onFocus}
                        placeholder={placeholder}
                        ref={this._saveInputRef}
                        hasError={hasError}
                        suffix={
                            <IconInput
                                icon={isLoading ? 'more_horiz' : 'search'}
                            />
                        }
                    />
                </DropdownToggle>
                <DropdownMenu className={css.dropdown}>
                    {this._renderHeader()}
                    {renderSubResult && subResults.length
                        ? this._renderSubResults()
                        : this._renderResults()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}
