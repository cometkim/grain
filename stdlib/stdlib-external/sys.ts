import {
  malloc,
  free
} from './ascutils/grainRuntime'

import {
  GRAIN_GENERIC_HEAP_TAG_TYPE
} from './ascutils/tags'

import {
  allocateArray,
  allocateString
} from './ascutils/dataStructures'

import {
  args_get,
  args_sizes_get
} from 'bindings/wasi'

export function argv(): u32 {
  let argcPtr = malloc(8)
  let argvBufSizePtr = argcPtr + 4

  let err_args_sizes_get = args_sizes_get(argcPtr, argvBufSizePtr)

  let argc = load<u32>(argcPtr)
  let argvBufSize = load<u32>(argvBufSizePtr)

  let argvPtr = malloc(argc * 4)
  let argvBufPtr = malloc(argvBufSize)

  let err_args_get = args_get(argvPtr, argvBufPtr)

  let arr = allocateArray(argc)

  let argsLength = argc * 4
  for (let i: u32; i < argsLength; i += 4) {
    let strPtr = load<u32>(argvPtr + i)
    let strLength = 0
    while (load<u8>(strPtr + strLength) !== 0) {
      strLength += 1
    }

    let grainStrPtr = allocateString(strLength)
    memory.copy(grainStrPtr + 8, strPtr, strLength)

    store<u32>(arr + i, grainStrPtr | GRAIN_GENERIC_HEAP_TAG_TYPE, 2 * 4)
  }

  free(argcPtr)
  free(argvPtr)
  free(argvBufPtr)
  
  return arr | GRAIN_GENERIC_HEAP_TAG_TYPE
}