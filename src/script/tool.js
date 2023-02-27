const mutableSetState = (data,key,val) => { data[key] = val }

const computeMenuClass = (isActive) => isActive ? 'active-menu' : 'default-menu';