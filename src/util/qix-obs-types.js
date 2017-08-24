const outputTypes = {
    "Global": [
        {
            "method": "OpenDoc",
            "obsType": "app"
        },
        {
            "method": "CreateDocEx",
            "obsType": "app"
        },
        {
            "method": "CreateSessionApp",
            "obsType": "app"
        },
        {
            "method": "CreateSessionAppFromApp",
            "obsType": "app"
        },
        {
            "method": "GetActiveDoc",
            "obsType": "app"
        }
    ],
    "Doc": [
        {
            "method": "CreateBookmark",
            "obsType": "generic-bookmark"
        },
        {
            "method": "CreateDimension",
            "obsType": "generic-dimension"
        },
        {
            "method": "CreateMeasure",
            "obsType": "generic-measure"
        },
        {
            "method": "CreateObject",
            "obsType": "generic-object"
        },
        {
            "method": "CreateSessionObject",
            "obsType": "generic-object"
        },
        {
            "method": "CreateSessionVariable",
            "obsType": "generic-variable"
        },
        {
            "method": "CreateVariableEx",
            "obsType": "generic-variable"
        },
        {
            "method": "GetBookmark",
            "obsType": "generic-bookmark"
        },
        {
            "method": "GetDimension",
            "obsType": "generic-dimension"
        },
        {
            "method": "GetField",
            "obsType": "field"
        },
        {
            "method": "GetMeasure",
            "obsType": "generic-measure"
        },
        {
            "method": "GetObject",
            "obsType": "generic-object"
        },
        {
            "method": "GetVariable",
            "obsType": "variable"
        },
        {
            "method": "GetVariableById",
            "obsType": "generic-variable"
        },
        {
            "method": "GetVariableByName",
            "obsType": "generic-variable"
        }
    ],
    "Field": [],
    "GenericBookmark": [],
    "GenericDimension": [],
    "GenericObject": [
        {
            "method": "CreateChild",
            "obsType": "generic-object"
        }
    ],
    "GenericMeasure": [],
    "GenericVariable": [],
    "Variable": [],
};
export default outputTypes;