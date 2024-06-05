import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { compile, StatefulLayout } from '../src/index.js'
// import Debug from 'debug'

// const debug = Debug('test')

const defaultOptions = { debounceInputMs: 0, removeAdditional: true }

describe('conditional schema support', () => {
  it('should display properties from a if/then/else', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: {
        str1: { type: 'string' }
      },
      if: {
        required: ['str1'],
        properties: { str1: { const: 'test' } }
      },
      then: {
        properties: {
          str2: { type: 'string' }
        }
      },
      else: {
        properties: {
          str3: { type: 'string' }
        }
      }
    })
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, defaultOptions)
    assert.equal(statefulLayout.stateTree.root.layout.comp, 'section')
    assert.equal(statefulLayout.stateTree.root.children?.length, 3)

    // input that satisfies the if condition
    statefulLayout.input(statefulLayout.stateTree.root.children[0], 'test')
    assert.equal(statefulLayout.stateTree.root.children[1].layout.comp, 'section')
    assert.equal(statefulLayout.stateTree.root.children[2].layout.comp, 'none')
    assert.equal(statefulLayout.stateTree.root.children[1].children?.length, 3)
    statefulLayout.input(statefulLayout.stateTree.root.children[1].children[0], 'hello')
    assert.deepEqual(statefulLayout.data, { str1: 'test', str2: 'hello' })

    // input that satisfies the else condition
    statefulLayout.input(statefulLayout.stateTree.root.children[0], 'not test')
    assert.equal(statefulLayout.stateTree.root.children[1].layout.comp, 'none')
    assert.equal(statefulLayout.stateTree.root.children[2].layout.comp, 'section')
    assert.deepEqual(statefulLayout.data, { str1: 'test' })
    assert.equal(statefulLayout.stateTree.root.children[2].children?.length, 3)
    statefulLayout.input(statefulLayout.stateTree.root.children[2].children[0], 'hello')
    assert.deepEqual(statefulLayout.data, { str1: 'test', str3: 'hello' })
  })

  it('should display properties from a dependentSchema', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: {
        str1: { type: 'string' }
      },
      dependentSchemas: {
        str1: {
          properties: {
            str2: { type: 'string' }
          }
        }
      }
    })
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, defaultOptions)
    assert.equal(statefulLayout.stateTree.root.layout.comp, 'section')
    assert.equal(statefulLayout.stateTree.root.children?.length, 2)
    assert.equal(statefulLayout.stateTree.root.children[0].layout.comp, 'text-field')
    assert.equal(statefulLayout.stateTree.root.children[1].layout.comp, 'none')

    // input that satisfies the dependency
    statefulLayout.input(statefulLayout.stateTree.root.children[0], 'test')
    assert.equal(statefulLayout.stateTree.root.children[1].layout.comp, 'section')
  })

  it('should manage errors coming from dependentRequired', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: {
        str1: { type: 'string' },
        str2: { type: 'string' }
      },
      dependentRequired: {
        str1: ['str2']
      }
    })
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, defaultOptions)
    assert.equal(statefulLayout.stateTree.root.layout.comp, 'section')
    assert.equal(statefulLayout.stateTree.root.children?.length, 2)
    assert.equal(statefulLayout.stateTree.root.children[0].layout.comp, 'text-field')
    assert.equal(statefulLayout.stateTree.root.children[1].layout.comp, 'text-field')
    assert.ok(!statefulLayout.stateTree.root.children[1].error)

    // input that satisfies the dependency
    statefulLayout.input(statefulLayout.stateTree.root.children[0], 'test')
    assert.equal(statefulLayout.stateTree.root.children[1].error, 'required information')
  })

  // TODO: dependentRequired should be managed strictly by ajv, but add a test to be sure
  // TODO: dependentSchemas
})