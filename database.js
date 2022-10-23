const { Client } = require('pg');
let format = require('pg-format');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '134679',
    port: 5432,
});

client.connect();


const getPosts = async () =>{
    const query = 'SELECT * FROM posts';
    let result = await client.query(query).then(res => {
        return res.rows;
    });
    return result;
}
const getPostsByUser = async (nickname)=>{
    const query = 'select * from posts where post_author = ' + `'`+nickname+`'`
    let result = await client.query(query).then(res =>{
        return res.rows
    })
    return result;
}
const getCommentsByUser = async (nickname)=>{
    const query = 'select * from comments where author = ' + `'${nickname}'`
    let result = await client.query(query).then(res =>{
        return res.rows
    })
    return result;
}

const getPost = async (id) => {
    const query = 'SELECT * FROM posts WHERE post_id = ' + id;
    let result = await client.query(query).then(res =>{
        var k = res.rows[0];
        return k;
    })
    return result;
}

const getPostsByText = async (text) => {
    const query = `select * from posts where post_content like` + `'%` + text + `%'`;
    let result = await client.query(query).then(res =>{
        return res.rows;
    })
    return result;
}


const getComments = async (post_id) =>{
    const query = 'SELECT * FROM comments WHERE post_id = ' + post_id;
    let result = await client.query(query).then(res =>{
        return res.rows;
    })
    return result;
}

const getUser = async (nickname)=>{
    const query = 'select * from users where login = ' + `'${nickname}'`;
    let result = await client.query(query).then(res=>{
        return res.rows[0];
    })
    return result;
}

const addComment = async (user, date, comment, post) => {
    let values = [[user, date, comment, post,]];
    await client.query(format('INSERT INTO comments (author,cmnt_date, cmnt_txt, post_id) VALUES %L', values), [], (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Data insert successful');
    });
}

const addPost = async (post_name, pub_date, post_author, post_content) => {
    let values = [[post_name, pub_date,post_author, post_content]];
    await client.query(format('INSERT INTO posts (post_name, pub_date, post_author, post_content) VALUES %L', values), [], (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Data insert successful');
    });
}

const checkLogin = async (login, password, flag) => {
    let asdf = ``;
    if (flag){
        asdf = `' and password = '` + password;
    }
    const query = `select exists(select * from users where login = '` + login + asdf + `')`;
    let result = await client.query(query).then(res => {
        return res.rows;
    })
    return result[0].exists;
}

const addLogin = async (login, password) => {
    if (await checkLogin(login, password, false)){
        return false;
    } else {
        let date = new Date();
        let values = [[login, password, date]];
        await client.query(format('INSERT INTO users (login, password, reg_date) VALUES %L', values),[], (err, res) => {
            if (err) {
                console.error(err);
                return false;
            }
        });
        return true;
    }
}
module.exports = {client, getPost, getComments, getPosts, addComment, checkLogin, addLogin,getUser, getPostsByText, getPostsByUser,getCommentsByUser,addPost}