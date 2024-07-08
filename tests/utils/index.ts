export * from './RWSimulator'

export function delay<T = any>(time: number, call?: () => Promise<T>): Promise<T> {
  return new Promise(resolve => setTimeout(async () => {
    if (call) {
      resolve(await call())
      return
    }
    resolve(undefined as T)
  }, time))
}

export function flatten(arr: any[]) {
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}

export function checkLocksResults(actions: string[]) {
  if (actions.length === 0) {
    throw new Error('No actions means, test fails')
  }
  let refsSingle = 0
  let refMulti = 0
  for(let i = 0; i < actions.length; i++) {
    const action = actions[i]
    switch(action) {
      case 'S:L': {
        if (refsSingle !== 0 || refMulti !== 0) {
          throw new Error('Cant lock single scope, something is opened')
        }
        refsSingle++
        break
      }
      case 'S:U': {
        refsSingle--
        if (refsSingle !== 0 || refMulti !== 0) {
          throw new Error('Unlock after single scope needs to ends with 0 refs.')
        }
        break
      }
      case 'M:L': {
        if (refsSingle !== 0) {
          throw new Error('Cant enter multi scope, some single is opened.')
        }
        refMulti++
        break
      }
      case 'M:U': {
        refMulti--
        if (refMulti < 0 || refsSingle !== 0) {
          throw new Error('Unlock after multi scope needs to ends with 0 refs of single, also multi refs count should be >= 0.')
        }
        break
      }
    }
  }

  if (refsSingle !== 0 || refMulti !== 0) {
    throw new Error('Something is opened on the end of test')
  }

}