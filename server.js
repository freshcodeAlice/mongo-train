const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const yup = require('yup');

const app = express();
const server = http.createServer(app);

const DB_NAME = process.env.DB_NAME || 'jsd_mongoose';
const { Schema } = mongoose;

const emailValidationSchema = yup.string().email().required();

mongoose
.connect(`mongodb://localhost:27017/${DB_NAME}`)
.catch((err) => {
    throw err;
    process.exit(1);
});

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /[A-za-z]{2,32}/.test(v)
        }
      },
    lastName: {
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (v) => emailValidationSchema.isValid(v)
        }
      },
    gender: {
        type: String,
        required: true
      },
    birthday: {
        type: Date
      }
});

const User = mongoose.model('User', userSchema);



const postSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    imgSrc: String,
    author:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }
});

const Post = mongoose.model('Post', postSchema)









/* routes */

app.use(express.json());


/* CRUD users */

app.post('/users/', async (req, res, next) => {
try {
    const {body} = req;
   const createdUser = await User.create(body);
    res.send(createdUser);
} catch(error) {
    next(error);
}
});

app.get('/users/', async (req, res, next) => {
    try {
   const users = await User.find();
   res.send(users)
    } catch(error) {
        next(error)
    }
});

app.patch('/users/:userId', async (req, res, next) => {
    try {
   const {body, params: {userId}} = req;
  const updatedUser = await User.findOneAndUpdate({_id: userId}, body, {
    returnDocument: 'after' // new: bool
  });
  res.send(updatedUser);
    } catch(error) {
        next(error);
    }
    });

app.delete('/users/:userId', async (req, res, next) => {
    try {
        const {params: {userId}}= req;
     const deletedUser = await User.findByIdAndDelete(userId);
     if(!deletedUser) {
        res.status(404).send('User not found')
     }
     res.send(deletedUser);
    } catch(error) {
        next(error);
    }
    });

/* CRUD posts */


app.post('/:userId/posts', async (req, res, next) => {
    try {
      const {params: {userId}, body} = req;
      const createdPost = await Post.create({...body, author: userId})
      res.send(createdPost)
    } catch(error) {
        next(error);
    }
    });
app.get('/posts', async (req, res, next) => {
    const {query: {limit, skip}} = req;
    Post
    .find({}, null, {
        limit,
        skip
    })
    .populate('author')
    .exec(
        (err, posts) => {
            if (err) {
                throw err
            }
            res.send(posts)
        }
    )
    });


app.get('/:userId/posts', async (req, res, next) => {
    try {
    const {params: {userId}} = req;
    const userPosts = await Post.find({author: userId});
    res.send(userPosts)
    } catch(error) {
        next(error)
    }
})


/* listening */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`App started on port ${PORT}`)
});