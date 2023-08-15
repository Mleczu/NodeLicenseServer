const mysql = require('mysql')

let con

const connect = (options) => {
    con = mysql.createConnection({
        host: options.host || 'localhost',
        user: options.user || 'root',
        password: options.password || '',
        database: options.database
    })
    return db
}

const dbPromise = (sql) => {
    return new Promise((resolve, reject)=>{
        con.query(sql, (err,res)=>{
            if(err){
                reject(err);
            }
            resolve(res);
        })
    });
}

const db = async (sql) => {
    if (!con) throw new Error('Database is not connected')
    try {
        let data = await dbPromise(sql);
        return data;
    } catch (e) {
        throw e
    }
}

module.exports = { connect, db }