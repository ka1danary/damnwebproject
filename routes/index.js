var express = require('express');
const Console = require("console");
var router = express.Router();
const url = require('url');

const {client, getPost, getComments, getPosts, addComment , checkLogin, addLogin, getUser, getPostsByText, getPostsByUser, getCommentsByUser, addPost} = require("../database");

function isEmptyObject(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;

}

router.get('/',async (req,res)=>{
    let login = req.body['login'];
    let user = await getUser(login);

    let text = '';
    const queryObject = url.parse(req.url, true).query;

    if(queryObject.text){
        text = queryObject.text;
        let posts = await getPostsByText(text);
        res.render('homepage', {
            posts: posts
        })
    } else {
        getPosts().then(async (p) => {
            if (isEmptyObject(p)) {
                console.log("Not found page in table " + index_page + " " + p);
                res.sendFile(__dirname + "\\404.html");
                return;
            }
            res.render('homepage', {
                posts: p,
            });
        })
    }
})

router.get("/article/:index_page", async (req, res) => {
    var index_page = req.params.index_page;
    if (isNaN(index_page)) {
        res.sendFile(__dirname + "\\404.html");
        return
    }
    let post = await getPost(index_page);
    if (isEmptyObject(post)) {
        console.log("Not found page in table " + index_page + " " + post);
        res.sendFile(__dirname + "\\404.html");
        return;
    }
    let comments = await getComments(index_page);
    console.log(comments)
    res.render('article', {
        posts: post,
        comments: comments,
    });
})
router.post("/article/:index_page", async (req,res)=>{
    let comment = req.body['comment-text'];
    let user = req.cookies['login']
    let post_id = req.params.index_page;
    let date = new Date();

    let flag = await addComment(user, date, comment, post_id, false);
    let post = await getPost(post_id);
    let comments = await getComments(post_id);
    console.log(comments)
    res.render('article',{
        posts : post,
        comments: comments,
    })

})
router.get('/new_post',(req,res)=>{
    res.render('create-post');
})
router.post("/new_post",async (req,res)=>{
    let post_name = req.body['title'];
    let pub_date = new Date();
    let post_author = req.cookies['login'];
    let post_content = req.body['main'];

    let flag = await addPost(post_name,pub_date,post_author,post_content,false);
    let posts = await getPosts();
    res.redirect('/');
})

router.get('/registration', (req, res) => {
    res.render('registration');
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/about',(req,res)=>{
    res.render('about');
})

router.get('/profile', async (req, res) => {
    let login = req.cookies['login'];
    let user = await getUser(login);
    let posts = await getPostsByUser(login);
    let comments = await getCommentsByUser(login);
    if (login !== undefined){
        res.render('profile', {
            Nickname: login,
            user : user,
            posts: posts,
            comments: comments,
        })
    } else {
        res.redirect("/login");
    }
})

router.post('/login', async(req, res) => {
    let login = req.body['login'];
    let password = req.body['password'];

    let flag = await checkLogin(login, password, true);

    if (flag){
        res.cookie('login', login);
        res.redirect("/profile");
    } else {
        res.render('login');
    }
})

router.post('/registration', async(req, res) => {
    let login = req.body['login'];
    let password = req.body['password'];

    let flag = await addLogin(login, password, false);

    if (flag){
        res.cookie('login', login);
        res.redirect("/profile");
    } else {
        res.render('registration');
    }
})

router.get('/sections', (req, res) => {
    getPosts().then( async (p) => {
        if (isEmptyObject(p)){
            console.log("Not found page in table " + index_page + " " + p);
            res.sendFile( __dirname +"\\404.html");
            return;
        }
        res.render('section', {
            posts:p,
        });
    })
})


module.exports = router;
