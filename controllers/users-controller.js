import userDao from "../database/users/users-dao.js";
import collectionDao from "../database/collection/collection-dao.js";
import express from "express";
import bcrypt from 'bcrypt';
const saltRounds = 10;

const usersController = (app) => {
    app.use(express.json());
    app.get('/api/users', findAllUsers);
    app.get('/api/users/:id', findUserById);
    app.get('/api/users/email/:email', findUserByEmail);
    app.put('/api/users', updateUser);
    app.delete('/api/users/:user_id', deleteUser);
}

const findAllUsers = async (req, res) => {
    const users = await userDao.findAllUsers()
    res.json(users)
}

const findUserById = async (req, res) => {
    const user_id = req.params['id']
    const user = await userDao.findUserById(user_id)
    if (user) {
        user.password = "";
        res.json(user)
    } else {
        res.sendStatus(404)
    }
}

const findUserByEmail = async (req, res) => {
    const email = req.params.email
    const user = await userDao.findUserByEmail(email)
    if (user) {
        res.json(user)
    } else {
        res.sendStatus(404)
    }
}

const updateUser = async (req, res) => {
    const user = req.body;
    const password = user.password;
    let hash = null;
    // if admin is wanting to update a password, then determine the hash
    if ( password ){
        hash = await bcrypt.hash(password, saltRounds);
    }

    if ( hash ) {
        user.password = hash;
    }

    const user_id = user._id;
    const status = await userDao.updateUser(user_id, user)
    if (status.modifiedCount === 1) {
        res.sendStatus(200)
    }
}

const deleteUser = async (req, res) => {
    const user_id = req.params.user_id
    const user_being_deleted = await userDao.findUserById(user_id)
    // must delete the collection from the user when deleting a user
    // because of some inconsistencies with the schema creation, need to check if this exists
    if ( user_being_deleted.hasOwnProperty("collection_id") ) {
        const collection_status = await collectionDao.deleteCollection(user_being_deleted.collection_id)
        if ( collection_status.deletedCount !== 1) {
            return res.sendStatus(400)
        }
    }

    const user_status = await userDao.deleteUser(user_id)
    if (user_status.deletedCount === 1) {
        res.sendStatus(200)
    }
}

export default usersController;