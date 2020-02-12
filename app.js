const express = require('express'),
methodOverride = require('method-override'),
expressSanitizer = require('express-sanitizer'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
app = express()
require('dotenv').config()

//app config
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blog_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer())
app.use(methodOverride('_method'))

const port = process.env.port || 3000

//Mongoose model/configuration
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

const Blog = mongoose.model("Blog", blogSchema)
// Blog.create({
//     title: 'Test Blog',
//     image: 'https://images.unsplash.com/photo-1435771112039-1e5b2bcad966?dpr=2&fit=crop&fm=jpg&h=825&q=50&w=1450',
//     body: 'My first blog and all the interesting things in here.'
// })

//RESTful Routes

app.get("/", (req, res) => {
    res.redirect("blogs")
})
//INDEX ROUTER
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) console.log(err)
        else res.render("index", {blogs})
    })
})

app.get('/blogs/new', (req,res) => {
    res.render('new')
})
// CREATE ROUTE
app.post('/blogs', (req, res) => {
    //sanitize the input to prevent malicious activity
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) res.render("new")
        //redirect
        else res.redirect("blogs");
    })
})

// SHOW ROUTE

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) throw err;
        else res.render("show", {blog: foundBlog})
    })
})

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) res.redirect('/blogs')
        else res.render('edit', {blog: foundBlog})
    })
    
})
 //UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    //Sanitizing the body with middleware, same as create route
    req.body.blog.body = req.sanitize(req.body.blog.body)
    console.log(req.params)
    Blog.findOneAndUpdate({_id: req.params.id}, req.body.blog, (err, updateBlog) => {
        if (err) console.log(err)
        else res.redirect('/blogs/' + req.params.id)
    })

})

//DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    Blog.findOneAndDelete({_id: req.params.id}, (err, deletedBlog) => {
        if (err) throw err;
        else res.redirect('/blogs')
    })
})

app.listen(port, () => {
    console.log("Server is running")
})