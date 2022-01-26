import localStorageDB from 'localstoragedb'
export const createDB = (name) => {
    var lib = new localStorageDB(name, localStorage);

    return lib;
}

export const addBaseData = (lib, table, data, field) => {
    // create the table and insert records in one go
    if (data) {
        lib.createTableWithData(table, data);
    } else {
        if (field) {
            lib.createTable(table, field)
        }
    }
	lib.commit();
}

export const queryTable = (lib, table, query) => {
    return lib.queryAll(table, {
        query: query
    });
}

export const insertOrUpdate = (lib, table, payload) => {
    lib.insertOrUpdate(table, {id: payload.id},    
        {	
            id: payload.id,
            title: payload.title,
            url: payload.url,
            date: payload.date
        }
    );

    lib.commit();
}

export const deleteRow = (lib, table, payload) => {
    lib.deleteRows(table, payload);
    lib.commit();
}

export const deleteTable = (lib, table) => {
    lib.dropTable(table);
    lib.commit();
}

export const getListTables = (databaseName) => {
    let db = JSON.parse(localStorage.getItem('db_' + databaseName))
    var listTablesName = []
    for (const table in db.tables) {
        listTablesName.push(table)
    }
    return listTablesName
}
