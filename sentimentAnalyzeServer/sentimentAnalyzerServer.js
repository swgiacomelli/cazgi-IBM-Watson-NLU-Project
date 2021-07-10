const express = require('express');
const app = new express();

app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;

    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({ apikey: api_key, }),
        serviceUrl: api_url,
    });
    return naturalLanguageUnderstanding;
}

function getEmotions(value, is_url, res) {
    let nlu = getNLUInstance();
    let nluParams = null;

    if (is_url) {
        nluParams = { url: value, features: { emotion: {} } };
    }
    else {
        nluParams = { text: value, features: { emotion: {} } };
    }

    nlu.analyze(nluParams).then(analysisResults => {
        res.send(analysisResults.result.emotion.document.emotion);
    })
        .catch(err => {
            res.status(500).send({ error: err.toString() });
            console.log("error:", err.toString())
        });
}

function getSentiment(value, is_url, res) {
    let nlu = getNLUInstance();
    let nluParams = null;

    if (is_url) {
        nluParams = { url: value, features: { sentiment: {} } };
    }
    else {
        nluParams = { text: value, features: { sentiment: {} } };
    }

    nlu.analyze(nluParams).then(analysisResults => {
        res.send(analysisResults.result.sentiment.document.label);
    })
        .catch(err => {
            res.status(500).send({ error: err.toString() });
            console.log("error:", err.toString())
        });
}

app.get("/", (req, res) => {
    res.render('index.html');
});

app.get("/url/emotion", (req, res) => {
    getEmotions(req.query.url, true, res);
});

app.get("/url/sentiment", (req, res) => {
    getSentiment(req.query.url, true, res);
});

app.get("/text/emotion", (req, res) => {
    getEmotions(req.query.text, false, res);
});

app.get("/text/sentiment", (req, res) => {
    getSentiment(req.query.text, false, res);
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

