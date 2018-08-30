const fetch = require('node-fetch')
const express = require('express')
const os = require('os')

const conf = require('../../conf')
const WORDNIK_API_KEY = (conf[0].WORDNIK_API_KEY)

const WORDNIK_URL = `http://api.wordnik.com/v4/words.json/randomWord?api_key=${WORDNIK_API_KEY}`
const WORDNIK_SEARCH_URL = `https://api.wordnik.com/v4/words.json/search/`
const WORDNIK_RELATED_WORDS_URL = "https://api.wordnik.com/v4/word.json"

const relationshipTypes = ["rhyme", "synonym", "related-word", "has-topic"]

// const relationshipTypes = require('./relationship-types')//["rhyme", "synonym", "related-word", "has-topic"]

const app = express();
app.use(express.static("dist"));

app.get("/api/nickname/:name", handleNickName)

app.listen(6060, ()=>{console.log('listeninng on 6060...')});


// (async function(){
//     let name = "dad";
//     console.log('building possible nicknames...ss.')
//     let nickname = await generateNickName(name)
//     // console.log(name)
//     console.log(`your nickname is ${name} ` + nickname)
    
// })();

async function handleNickName(req, res){
    let data = req.params;
    let name = (data.name);
    console.log('finding for ' + name)
    let nickname = await generateNickName(name);
    console.log(`found ${nickname} for ${name}`)
    res.send(`we think you should be called ${name} ${nickname}`)
}

async function generateNickName(name){
    let possibleNickNames = await buildWordList(name)
    let nickname = pickNickname(possibleNickNames)
    console.log('got nicked ' + nickname)
    return nickname;
}

function pickNickname(options){
    let numLists = 0;
    let allWords = [];

    for(const option of options){
        let data = option[0]
        if(data){
            let matchType = data.relationshipType
            let words = data.words;

            for(const word in words){
                allWords.push(words[word])
            }
        }
    }

    //choose a random item from that list
    let wordIndex = Math.floor(Math.random() * allWords.length);
    let word = allWords[wordIndex]

    return word
}

async function buildWordList(word){
    let list = [];

    for(const relationship of relationshipTypes) {
        let words = await getRelatedWords(word, relationship)        
        list.push(words)
    };

    return list;
}

async function getRelatedWords(word, relationships, limit=10){
    let request = `${WORDNIK_RELATED_WORDS_URL}/${word}/relatedWords?useCannonical=true`
    request += `&relationshipTypes=${relationships}`
    request += `&limitPerRelationshipType=${limit}` 
    request += `&api_key=${WORDNIK_API_KEY}`
    let response = await fetch(request);
    let json =  response.json()
    return json
}

async function searchWord(word, minLength, maxLength, limit=10){
    let request = `${WORDNIK_SEARCH_URL}${word}?api_key=${WORDNIK_API_KEY}`
    let response = await fetch(request);
    let json = await response.json();
    return json; 
}

async function getRandomWord()
{
    let response = await fetch(WORDNIK_URL);
    let json = await response.json()
    return json;
}
