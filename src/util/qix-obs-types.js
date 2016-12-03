const outputTypes = {
    "Global": [
        {
            "method": "OpenDoc",
            "obsType": "AppObservable"
        },
        {
            "method": "CreateDocEx",
            "obsType": "AppObservable"
        },
        {
            "method": "CreateSessionApp",
            "obsType": "AppObservable"
        },
        {
            "method": "CreateSessionAppFromApp",
            "obsType": "AppObservable"
        },
        {
            "method": "GetActiveDoc",
            "obsType": "AppObservable"
        }
    ],
    "Doc": [
        {
            "method": "CreateBookmark",
            "obsType": "GenericBookmarkObservable"
        },
        {
            "method": "CreateDimension",
            "obsType": "GenericDimensionObservable"
        },
        {
            "method": "CreateMeasure",
            "obsType": "GenericMeasureObservable"
        },
        {
            "method": "CreateObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "CreateSessionObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "CreateSessionVariable",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "CreateVariableEx",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "GetBookmark",
            "obsType": "GenericBookmarkObservable"
        },
        {
            "method": "GetDimension",
            "obsType": "GenericDimensionObservable"
        },
        {
            "method": "GetField",
            "obsType": "FieldObservable"
        },
        {
            "method": "GetMeasure",
            "obsType": "GenericMeasureObservable"
        },
        {
            "method": "GetObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "GetVariable",
            "obsType": "VariableObservable"
        },
        {
            "method": "GetVariableById",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "GetVariableByName",
            "obsType": "GenericVariableObservable"
        }
    ],
    "Field": [],
    "GenericBookmark": [],
    "GenericDimension": [],
    "GenericObject": [],
    "GenericMeasure": [],
    "GenericVariable": [],
    "Variable": [],
};
export default outputTypes;