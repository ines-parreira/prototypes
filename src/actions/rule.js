import reqwest from 'reqwest'
import * as ActionTypes from '../constants/rule/ActionTypes'


/* Actions */
export function addRuleStart(type, code) {
    return {
        type: ActionTypes.ADD_RULE_START,
        title: type,
        code
    }
}

export function addRuleEnd(rule) {
    return {
        type: ActionTypes.ADD_RULE_END,
        rule
    }
}

export function requestRules(url) {
    return {
        type: ActionTypes.RULES_REQUESTS_POSTS,
        url
    }
}

export function receiveRules(rules) {
    return {
        type: ActionTypes.RULES_RECEIVE_POSTS,
        rules: rules
    }
}

export function errorMsg(errormsg) {
    return {
        type: ActionTypes.ERROR_MESSAGE,
        errormsg
    }
}

export function modifyCodeast(index, path, value) {
    return {
        type: ActionTypes.RULES_UPDATE_CODE_AST,
        index,
        path,
        value
    }
}

// Submit rule
export function submitRule(url, comment) {
    return (dispatch) => {
        dispatch(addRuleStart(comment.type, comment.code))

        return reqwest({
            url: url,
            type: 'json',
            method: 'POST',
            data: JSON.stringify(comment),
            contentType: "application/json"
        }).then((resp) => {
            dispatch(addRuleEnd(resp))
        }).fail((resp) => {
            dispatch(errorMsg('Ops, Server error.' + resp))
        })
    }
}

export function fetchRules(url) {
    return (dispatch) => {
        dispatch(requestRules(url))

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: "application/json"
        }).then((resp) => {
            dispatch(receiveRules(resp.data))
        })
    }
}
