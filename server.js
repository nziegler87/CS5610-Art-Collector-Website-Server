import * as dotenv from 'dotenv'
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import cors from "cors";
import connectMongo from "connect-mongo";


import UsersController from "./controllers/users-controller.js";
import CommentsController from "./controllers/comments-controller.js";
import WikiArtController from "./controllers/wiki-art-controller.js";
import SessionController from "./controllers/session-controller.js";
import AuthController from "./controllers/auth-controller.js";
import CollectionsController from "./controllers/collection-controller.js";
import TransactionsController from "./controllers/transactions-controller.js";
import ListingsController from "./controllers/listings-controller.js";
import OffersController from "./controllers/offers-controller.js";
import MemoryStore from "express-session/session/memory.js";
import MongoStore from "connect-mongo";
const app = express();


const CONNECTION_STRING = (process.env.DB_CONNECTION_STRING);

const connectWithRetry = () => {
    return mongoose.connect(CONNECTION_STRING,  (err) => {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            setTimeout(connectWithRetry, 5000);
        }
    });
};
connectWithRetry();


app.use(cors({
    origin: (process.env.CORS_URL),
    credentials: true
}));

app.use(express.json());
app.set('trust proxy', 1);

// https://www.section.io/engineering-education/session-management-in-nodejs-using-expressjs-and-express-session/
// ^^ explains these variables

// https://stackoverflow.com/questions/66503751/cross-domain-session-cookie-express-api-on-heroku-react-app-on-netlify
// ^^ this was also super helpful with getting cookies to work in production

// https://stackoverflow.com/questions/59384430/cookies-only-set-in-chrome-not-set-in-safari-mobile-chrome-or-mobile-safari
// ^^ this also explains why cookies don't work in Safari

app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 8640,
    }),

    // I believe this is just to encrypt data
    secret: process.env.NODE_ENV === 'production' ? process.env.SECRET_KEY : "super secret key",

    // according to GFG, setting this to true "forces the session to be saved back to the session store
    // changing this from true (the default) to false can help prevent race situations
    resave: false,

    // according to GFG, this forces a session that is "uninitialized" to be saved to the store
    saveUninitialized: true,
    cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

UsersController(app);
CommentsController(app);
WikiArtController(app);
SessionController(app);
AuthController(app);
CollectionsController(app);
TransactionsController(app);
ListingsController(app);
OffersController(app);

app.listen(process.env.PORT);