const outputTypes = {
    "Global": [
        {
            "method": "openDoc",
            "obsType": "AppObservable"
        },
        {
            "method": "createDocEx",
            "obsType": "AppObservable"
        },
        {
            "method": "createSessionApp",
            "obsType": "AppObservable"
        },
        {
            "method": "createSessionAppFromApp",
            "obsType": "AppObservable"
        },
        {
            "method": "getActiveDoc",
            "obsType": "AppObservable"
        }
    ],
    "Doc": [
        {
            "method": "createBookmark",
            "obsType": "GenericBookmarkObservable"
        },
        {
            "method": "createDimension",
            "obsType": "GenericDimensionObservable"
        },
        {
            "method": "createMeasure",
            "obsType": "GenericMeasureObservable"
        },
        {
            "method": "createObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "createSessionObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "createSessionVariable",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "createVariableEx",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "getBookmark",
            "obsType": "GenericBookmarkObservable"
        },
        {
            "method": "getDimension",
            "obsType": "GenericDimensionObservable"
        },
        {
            "method": "getField",
            "obsType": "FieldObservable"
        },
        {
            "method": "getMeasure",
            "obsType": "GenericMeasureObservable"
        },
        {
            "method": "getObject",
            "obsType": "GenericObjectObservable"
        },
        {
            "method": "getVariable",
            "obsType": "VariableObservable"
        },
        {
            "method": "getVariableById",
            "obsType": "GenericVariableObservable"
        },
        {
            "method": "getVariableByName",
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