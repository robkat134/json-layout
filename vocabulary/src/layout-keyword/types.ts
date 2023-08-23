export type LayoutKeyword = ComponentName | PartialChildren | PartialCompObject | PartialSwitch;
export type ComponentName = "none" | "text-field" | "number-field" | "textarea" | "checkbox" | "section" | "list";
export type PartialChild = PartialCompObject & {
  key?: string | number;
  width?: number;
  [k: string]: unknown;
};
export type PartialExpression =
  | string
  | {
      type?: "expr-eval" | "js-fn";
      expr: string;
      [k: string]: unknown;
    };
export type PartialChildren = (string | PartialChild)[];

export interface PartialCompObject {
  comp?: ComponentName;
  children?: PartialChildren;
  label?: string;
  title?: string;
  step?: number;
  if?: PartialExpression;
}
export interface PartialSwitch {
  switch: PartialCompObject[];
}

// raw schema
export const layoutKeywordSchema = {
  "$id": "https://json-layout.github.io/layout-keyword",
  "title": "layout keyword",
  "oneOf": [
    {
      "$ref": "#/$defs/comp-name"
    },
    {
      "$ref": "#/$defs/partial-children"
    },
    {
      "$ref": "#/$defs/partial-comp-object"
    },
    {
      "$ref": "#/$defs/partial-switch"
    }
  ],
  "$defs": {
    "partial-switch": {
      "type": "object",
      "required": [
        "switch"
      ],
      "additionalProperties": false,
      "properties": {
        "switch": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/partial-comp-object"
          }
        }
      }
    },
    "partial-comp-object": {
      "title": "partial comp object",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "comp": {
          "$ref": "#/$defs/comp-name"
        },
        "children": {
          "$ref": "#/$defs/partial-children"
        },
        "label": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "step": {
          "type": "number"
        },
        "if": {
          "$ref": "#/$defs/partial-expression"
        }
      }
    },
    "comp-name": {
      "title": "component name",
      "type": "string",
      "enum": [
        "none",
        "text-field",
        "number-field",
        "textarea",
        "checkbox",
        "section",
        "list"
      ]
    },
    "partial-child": {
      "type": "object",
      "unevaluatedProperties": false,
      "allOf": [
        {
          "$ref": "#/$defs/partial-comp-object"
        },
        {
          "properties": {
            "key": {
              "type": [
                "string",
                "integer"
              ]
            },
            "width": {
              "type": "number"
            }
          }
        }
      ]
    },
    "partial-children": {
      "type": "array",
      "items": {
        "oneOf": [
          {
            "type": "string"
          },
          {
            "$ref": "#/$defs/partial-child"
          }
        ]
      }
    },
    "partial-expression": {
      "oneOf": [
        {
          "type": "string"
        },
        {
          "type": "object",
          "required": [
            "expr"
          ],
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "expr-eval",
                "js-fn"
              ],
              "default": "expr-eval"
            },
            "expr": {
              "type": "string"
            }
          }
        }
      ]
    }
  }
}
