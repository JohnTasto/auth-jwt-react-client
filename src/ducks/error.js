export const types = {
  CLEAR: 'error clear',
}


export const actions = {
  clear: () => ({ type: types.CLEAR }),
}


export default (state = null, action) => {
  const { type, error } = action

  if (type === types.CLEAR) {
    return null
  } else if (error) {
    return error
  }

  return state
}
