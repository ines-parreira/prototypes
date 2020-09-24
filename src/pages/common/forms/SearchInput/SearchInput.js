// @flow

import React, {type ComponentType, type Node} from 'react'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
} from 'reactstrap'
import _debounce from 'lodash/debounce'
import _noop from 'lodash/noop'
import classnames from 'classnames'

import GorgiasApi from '../../../../services/gorgiasApi.ts'

//$TsFixMe on migration import type SearchResultType from gorgiasApi.ts
type SearchResultType = {
    id: number,
}

import type {SearchInputResultProps, SearchInputSubResultProps} from './types'
import css from './SearchInput.less'

type Props<ResultType, SubResultType> = {
    endpoint: string,
    autoFocus?: boolean,
    searchOnFocus?: boolean,
    className?: string,
    placeholder?: string,
    renderResult: ComponentType<SearchInputResultProps<ResultType>>,
    renderSubResult?: ComponentType<
        SearchInputSubResultProps<ResultType, SubResultType>
    >,
    onResultClicked: (
        result: ResultType
    ) => Array<SearchResultType & SubResultType> | void,
    onSubResultClicked: (result: ResultType, subResult: SubResultType) => void,
    resultLabel: string,
    resultLabelPlural: string,
    subResultLabel: string,
    subResultLabelPlural: string,
}

type State = {
    filter: string,
    isLoading: boolean,
    isOpen: boolean,
    results: Array<any>, // TODO should be `Array<ResultType>` but leads to flow error "expected type is not parametric"
    subResults: Array<SearchResultType & any>, // TODO should be `Array<SearchResultType & SubResultType>`
    clickedResult: any,
    hoveredIndex: number,
}

export default class SearchInput<
    ResultType,
    SubResultType = void
> extends React.PureComponent<Props<ResultType, SubResultType>, State> {
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
    }

    state = {
        filter: '',
        isLoading: false,
        isOpen: false,
        results: [],
        subResults: [],
        clickedResult: null,
        hoveredIndex: -1,
    }

    _inputElement: HTMLInputElement
    _gorgiasApi = new GorgiasApi()

    componentDidMount() {
        const {autoFocus} = this.props

        if (autoFocus && this._inputElement) {
            setTimeout(() => this._inputElement.focus(), 0)
        }
    }

    componentWillUnmount() {
        this._gorgiasApi.cancelPendingRequests()
    }

    _saveInputRef = (inputRef: HTMLInputElement) => {
        this._inputElement = inputRef
    }

    _toggle = () => {
        const {isOpen} = this.state
        this.setState({isOpen: !isOpen})
    }

    _onChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const filter = event.target.value
        this.setState({
            filter,
            isOpen: false,
            isLoading: true,
            hoveredIndex: -1,
        })
        this._fetchResults(filter)
    }

    _onKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
        const {results, subResults} = this.state
        const items = subResults.length ? subResults : results

        switch (event.key) {
            case 'ArrowDown': {
                const {hoveredIndex: currentIndex} = this.state

                let newIndex = currentIndex + 1
                if (newIndex >= items.length) {
                    newIndex = 0
                }

                this.setState({hoveredIndex: newIndex, isOpen: true})
                this._scrollToItem(newIndex)
                event.preventDefault()
                break
            }
            case 'ArrowUp': {
                const {hoveredIndex: currentIndex} = this.state

                let newIndex = currentIndex - 1
                if (newIndex < 0) {
                    newIndex = items.length - 1
                }

                this.setState({hoveredIndex: newIndex, isOpen: true})
                this._scrollToItem(newIndex)
                event.preventDefault()
                break
            }
            case 'Enter': {
                const {hoveredIndex} = this.state

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
                    this.setState({isOpen: false})
                }
                break
            }
            default:
                break
        }
    }

    _onFocus = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const filter = event.target.value
        const {searchOnFocus} = this.props
        const {isLoading, results} = this.state

        if (searchOnFocus && !isLoading && !results.length) {
            this._fetchResults(filter)
        }
    }

    _scrollToItem(index: number) {
        const dropdown = this._inputElement.closest('.dropdown')
        if (!dropdown) {
            return
        }

        const dropdownMenu = dropdown.querySelector('.dropdown-menu')
        if (!dropdownMenu) {
            return
        }

        const item = dropdownMenu.querySelector(
            `.dropdown-item:nth-of-type(${index + 1})`
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

    _fetchResults = _debounce(async (filter) => {
        try {
            this.setState({isOpen: false, isLoading: true})
            this._gorgiasApi.cancelPendingRequests(true)
            const {endpoint} = this.props
            const results = await this._gorgiasApi.search(endpoint, filter)
            this.setState({results})
        } catch (error) {
            this.setState({results: []})
            console.error(error)
        } finally {
            this.setState({isOpen: true, isLoading: false})
        }
    }, 300)

    _onBackClicked = () => {
        this.setState({
            clickedResult: null,
            hoveredIndex: -1,
            subResults: [],
        })
    }

    _onResultClicked(index: number) {
        const {onResultClicked} = this.props
        const {results} = this.state
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
        const {onSubResultClicked} = this.props
        const {clickedResult, subResults} = this.state
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
        const {results, subResults} = this.state

        return (
            <DropdownItem header className={css.header}>
                {subResults.length ? (
                    <Button
                        className="mr-2"
                        type="button"
                        color="light"
                        size="sm"
                        onClick={this._onBackClicked}
                    >
                        <i className="icon material-icons mr-2">arrow_back</i>
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

    _renderResults(): Node {
        const {renderResult: Result} = this.props
        const {results, hoveredIndex} = this.state

        return results.length
            ? results.map((result, index) => (
                  <DropdownItem
                      key={`result-${result.id}`}
                      onMouseEnter={() => this.setState({hoveredIndex: index})}
                      onClick={() => this._onResultClicked(index)}
                      className={classnames(css.dropdownItem, {
                          [css.hoveredDropdownItem]: hoveredIndex === index,
                      })}
                      toggle={false}
                  >
                      <Result result={result} />
                  </DropdownItem>
              ))
            : null
    }

    _renderSubResults() {
        const {renderSubResult: SubResult} = this.props
        const {hoveredIndex, clickedResult, subResults} = this.state

        return subResults.length && clickedResult && SubResult
            ? subResults.map<Node>((subResult, index) => (
                  <DropdownItem
                      key={`sub-result-${subResult.id}`}
                      onMouseEnter={() => this.setState({hoveredIndex: index})}
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
        const {className, placeholder, renderSubResult} = this.props
        const {filter, isLoading, isOpen, subResults} = this.state

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
                    <i className="icon material-icons md-2">
                        {isLoading ? 'more_horiz' : 'search'}
                    </i>
                    <Input
                        type="text"
                        value={filter}
                        onChange={this._onChange}
                        onKeyDown={this._onKeyDown}
                        onFocus={this._onFocus}
                        placeholder={placeholder}
                        innerRef={this._saveInputRef}
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
