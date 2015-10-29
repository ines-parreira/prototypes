import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import RuleBox from './components/rule/Rule'

ReactDOM.render(
    <RuleBox url="/api/rules/"/>,
    document.getElementById('App')
)
