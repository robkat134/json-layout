import { type JSONLayoutExample } from '..'

const example: JSONLayoutExample = {
  title: 'Tabs',
  id: 'tabs',
  description: 'Children of an object can be rendered into tabs using `layout: {comp: \'tabs\'}` or the shorter `layout: \'tabs\'.',
  schema: {
    type: 'object',
    title: 'Tabs',
    layout: 'tabs',
    properties: {
      tab1: {
        type: 'object',
        title: 'Tab 1',
        properties: {
          str1: {
            type: 'string',
            title: 'String 1'
          },
          str2: {
            type: 'string',
            title: 'String 2'
          }
        }
      },
      tab2: {
        type: 'object',
        title: 'Tab 2',
        properties: {
          str3: {
            type: 'string',
            title: 'String 1'
          }
        }
      }
    }
  }
}

export default example
