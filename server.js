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



/* routes */

app.use(express.json());

app.post('/', async (req, res, next) => {
try {
    const {body} = req;
   const createdUser = await User.create(body);
    res.send(createdUser);
} catch(error) {
    next(error);
}
});


app.get('/', async (req, res, next) => {
    try {
   const users = await User.find();
   res.send(users)
    } catch(error) {
        next(error)
    }
});

app.patch('/:userId', async (req, res, next) => {
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

app.delete('/:userId', async (req, res, next) => {
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


/* listening */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`App started on port ${PORT}`)
});