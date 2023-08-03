// import { type Emitter } from 'mitt'
import { type LayoutNode, type CompiledLayout } from '../../compile'
import { type Mode } from '..'
// import { getDisplay } from '../utils'
import { type TextField, type CompObject, type Section, isSwitch } from '@json-layout/vocabulary'
import produce from 'immer'
import { type ErrorObject } from 'ajv'
import { type Display } from '../utils/display'
import { shallowCompareArrays } from '../utils/immutable'
// import { type ErrorObject } from 'ajv-errors'

export interface StateNode {
  layout: CompObject
  key: string
  pointer: string
  parentPointer: string | null
  dataPath: string
  parentDataPath: string | null
  mode: Mode
  value: unknown
  error: string | undefined
  children?: StateNode[]
}

export type TextFieldNode = Omit<StateNode, 'children'> & { layout: TextField, value: string }
export const isTextField = (node: StateNode | undefined): node is TextFieldNode => !!node && node.layout.comp === 'text-field'

export type SectionNode = StateNode & { layout: Section, value: Record<string, unknown>, children: StateNode[] }
export const isSection = (node: StateNode | undefined): node is SectionNode => !!node && node.layout.comp === 'section'

// use Immer for efficient updating with immutability and no-op detection
const updateStateNode = produce<StateNode, [LayoutNode, CompObject, Mode, unknown, string | undefined, StateNode[]?]>(
  (draft, skeleton, layout, mode, value, error, children?) => {
    draft.key = skeleton.key
    draft.pointer = skeleton.pointer
    draft.parentPointer = skeleton.parentPointer
    draft.dataPath = skeleton.dataPath
    draft.parentDataPath = skeleton.parentDataPath
    draft.layout = layout
    draft.mode = mode
    draft.value = value
    draft.error = error
    draft.children = children
  }
)

const nodeCompObject: CompObject = { comp: 'none' }

const matchError = (error: ErrorObject, skeleton: LayoutNode): boolean => {
  if (skeleton.parentDataPath === error.instancePath && error.params?.missingProperty === skeleton.key) return true
  if (skeleton.dataPath === error.instancePath) return true
  return false
}

export function produceStateNode (
  compiledLayout: CompiledLayout,
  nodesByPointers: Record<string, StateNode>,
  skeleton: LayoutNode,
  mode: Mode,
  display: Display,
  value: unknown,
  errors: ErrorObject[],
  reusedNode?: StateNode
): StateNode {
  const normalizedLayout = compiledLayout.normalizedLayouts[skeleton.pointer]
  // const display = getDisplay(containerWidth)
  let layout: CompObject
  if (isSwitch(normalizedLayout)) {
    layout = normalizedLayout.find(compObject => {
      if (!compObject.if) return true
      const compiledExpression = compiledLayout.expressions[compObject.if.type][compObject.if.expr]
      return !!compiledExpression(mode, display)
    }) ?? nodeCompObject
  } else {
    layout = normalizedLayout
  }
  // const fullKey = parentKey === null ? skeleton.key : (parentKey + '/' + skeleton.key)

  let children: StateNode[] | undefined
  if (layout.comp === 'section') {
    value = value ?? {}
    // TODO: make this type casting safe using prior validation
    const objectValue = (value ?? {}) as Record<string, unknown>
    children = skeleton.children?.map((child, i) => {
      return produceStateNode(compiledLayout, nodesByPointers, child, mode, display, objectValue[child.key], errors, reusedNode?.children?.[i])
    }).filter(child => child?.layout.comp !== 'none')
  }

  if (layout.comp === 'text-field') {
    value = value ?? ''
  }

  // filter errors array in-place
  // cf https://stackoverflow.com/questions/37318808/what-is-the-in-place-alternative-to-array-prototype-filter
  let error
  let nbRemainingErrors = 0
  for (const e of errors) {
    const originalError = e.params?.errors?.[0] ?? e
    if (matchError(originalError, skeleton)) {
      error = e
    } else {
      errors[nbRemainingErrors++] = e
    }
  }
  errors.splice(nbRemainingErrors)

  nodesByPointers[skeleton.pointer] = updateStateNode(reusedNode ?? ({} as StateNode), skeleton, layout, mode, value, error?.message, shallowCompareArrays(reusedNode?.children, children))
  return nodesByPointers[skeleton.pointer]
}

export const produceStateNodeValue = produce((draft, key, value) => {
  draft[key] = value
})
